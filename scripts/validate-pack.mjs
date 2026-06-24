#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseArtifactsDir = join(repoRoot, '.release-artifacts');

const PUBLISHABLE_PACKAGES = [
  'packages/contracts',
  'packages/core',
  'packages/plugins-typescript',
  'packages/plugins',
  'packages/cli',
];

const SMOKE_TEST_EXTRA_PACKAGES = ['packages/plugins-nestjs'];

const WORKSPACE_PROTOCOL_PATTERN = /^workspace:/;

async function main() {
  assertReleasePrerequisites();
  await prepareReleaseArtifactsDir();

  const artifactPaths = [];

  for (const packagePath of PUBLISHABLE_PACKAGES) {
    artifactPaths.push(await validatePackagePack(packagePath));
  }

  for (const packagePath of SMOKE_TEST_EXTRA_PACKAGES) {
    artifactPaths.push(await validatePackagePack(packagePath, { allowPrivate: true }));
  }

  console.log(`Validated ${PUBLISHABLE_PACKAGES.length} publishable package tarballs.`);

  await runInstallSmokeTest(artifactPaths);
}

function assertReleasePrerequisites() {
  for (const fileName of ['README.md', 'LICENSE']) {
    try {
      execSync(`test -f ${join(repoRoot, fileName)}`);
    } catch {
      throw new Error(`Missing required release file: ${fileName}`);
    }
  }
}

async function prepareReleaseArtifactsDir() {
  await rm(releaseArtifactsDir, { recursive: true, force: true });
  await mkdir(releaseArtifactsDir, { recursive: true });
}

async function validatePackagePack(relativePackagePath, options = {}) {
  const { allowPrivate = false } = options;
  const packageDir = join(repoRoot, relativePackagePath);
  const packageJsonPath = join(packageDir, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  if (packageJson.private && !allowPrivate) {
    throw new Error(`${packageJson.name} is private and should not be packed for release.`);
  }

  await assertDistExists(packageDir, packageJson.name);

  const tempDir = await mkdtemp(join(tmpdir(), 'envaudit-pack-'));
  const packDir = join(tempDir, 'package');

  try {
    const releasePackageJson = replaceWorkspaceDependencies(packageJson);
    await cp(join(packageDir, 'dist'), join(packDir, 'dist'), { recursive: true });
    await writeFile(join(packDir, 'package.json'), `${JSON.stringify(releasePackageJson, null, 2)}\n`);

    const tarballName = execSync(
      `npm pack --pack-destination ${JSON.stringify(releaseArtifactsDir)}`,
      {
        cwd: packDir,
        encoding: 'utf8',
      },
    )
      .trim()
      .split('\n')
      .at(-1)
      ?.trim();

    if (!tarballName) {
      throw new Error(`npm pack did not produce a tarball for ${packageJson.name}.`);
    }

    const tarballPath = join(releaseArtifactsDir, tarballName);
    const packedPackageJson = JSON.parse(
      execSync(`tar -xOzf ${JSON.stringify(tarballPath)} package/package.json`, {
        encoding: 'utf8',
      }),
    );

    assertNoWorkspaceDependencies(packedPackageJson, packageJson.name);
    assertContainsDist(packageJson.name, tarballPath);

    console.log(`OK ${packageJson.name} -> ${tarballPath}`);

    return tarballPath;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function runInstallSmokeTest(artifactPaths) {
  const cliTarball = artifactPaths.find(
    (path) => /\/envaudit-\d+\.\d+\.\d+\.tgz$/.test(path) && !/\/envaudit-[^/]+-\d/.test(path),
  );
  if (!cliTarball) {
    throw new Error('CLI tarball was not produced in .release-artifacts/.');
  }

  const smokeDir = await mkdtemp(join(tmpdir(), 'envaudit-smoke-'));
  const fixturePath = join(repoRoot, 'fixtures', 'full-stack-app');

  try {
    execSync('npm init -y', { cwd: smokeDir, stdio: 'pipe' });

    // Install all publishable tarballs so workspace deps resolve locally.
    const installArgs = artifactPaths.map((path) => JSON.stringify(path)).join(' ');
    execSync(`npm install ${installArgs}`, { cwd: smokeDir, stdio: 'pipe' });

    execSync('npx envaudit --help', { cwd: smokeDir, stdio: 'pipe' });
    runCommandAllowingExitCodes(`npx envaudit scan ${JSON.stringify(fixturePath)}`, smokeDir, [0, 1]);

    console.log(`Smoke test passed: installed ${cliTarball} and ran envaudit scan.`);
  } finally {
    await rm(smokeDir, { recursive: true, force: true });
  }
}

async function assertDistExists(packageDir, packageName) {
  const distDir = join(packageDir, 'dist');
  try {
    const entries = await readdir(distDir);
    if (entries.length === 0) {
      throw new Error(`${packageName} dist/ is empty. Run pnpm build:release first.`);
    }
  } catch (error) {
    throw new Error(`${packageName} is missing dist/. Run pnpm build:release first.`, {
      cause: error,
    });
  }
}

function replaceWorkspaceDependencies(packageJson) {
  const releasePackageJson = JSON.parse(JSON.stringify(packageJson));

  for (const field of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    const deps = releasePackageJson[field];
    if (!deps) {
      continue;
    }

    for (const [name, version] of Object.entries(deps)) {
      if (typeof version === 'string' && WORKSPACE_PROTOCOL_PATTERN.test(version)) {
        deps[name] = releasePackageJson.version;
      }
    }
  }

  delete releasePackageJson.devDependencies;

  return releasePackageJson;
}

function assertNoWorkspaceDependencies(packageJson, packageName) {
  for (const field of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    const deps = packageJson[field];
    if (!deps) {
      continue;
    }

    for (const [dependencyName, version] of Object.entries(deps)) {
      if (typeof version === 'string' && WORKSPACE_PROTOCOL_PATTERN.test(version)) {
        throw new Error(
          `${packageName} tarball still contains workspace dependency ${dependencyName}: ${version}`,
        );
      }
    }
  }
}

function assertContainsDist(packageName, tarballPath) {
  const listing = execSync(`tar -tzf ${JSON.stringify(tarballPath)}`, { encoding: 'utf8' });
  if (!listing.includes('package/dist/')) {
    throw new Error(`${packageName} tarball is missing package/dist/ contents.`);
  }
}

function runCommandAllowingExitCodes(command, cwd, allowedExitCodes) {
  try {
    execSync(command, { cwd, stdio: 'pipe' });
  } catch (error) {
    const exitCode = typeof error.status === 'number' ? error.status : null;
    if (exitCode !== null && allowedExitCodes.includes(exitCode)) {
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
