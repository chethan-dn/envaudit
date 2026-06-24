import { execSync } from 'node:child_process';
import { access, readdir, readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

const PUBLISHABLE_PACKAGES = [
  'packages/contracts',
  'packages/core',
  'packages/plugins-typescript',
  'packages/plugins',
  'packages/cli',
] as const;

const WORKSPACE_PACKAGES = [
  ...PUBLISHABLE_PACKAGES,
  'packages/plugins-nestjs',
  'packages/plugins-javascript',
] as const;

const EXPECTED_PACKAGE_NAMES: Record<(typeof WORKSPACE_PACKAGES)[number], string> = {
  'packages/cli': 'envanalyser',
  'packages/contracts': 'envanalyser-contracts',
  'packages/core': 'envanalyser-core',
  'packages/plugins': 'envanalyser-plugins',
  'packages/plugins-typescript': 'envanalyser-plugins-typescript',
  'packages/plugins-nestjs': 'envanalyser-plugins-nestjs',
  'packages/plugins-javascript': '@envaudit/plugins-javascript',
};

const FORBIDDEN_PUBLISHABLE_PATTERNS = [/@envaudit\b/, /\benvaudit-/];

async function readPackageJson(relativePackagePath: string) {
  const packageJsonPath = join(repoRoot, relativePackagePath, 'package.json');
  const packageJson = await import(packageJsonPath, { with: { type: 'json' } });
  return packageJson.default as {
    name: string;
    private?: boolean;
    bin?: Record<string, string>;
    exports?: Record<string, { import?: string; types?: string } | string>;
    main?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
  };
}

async function assertPathExists(path: string): Promise<void> {
  await access(path);
}

function collectDependencyNames(packageJson: Awaited<ReturnType<typeof readPackageJson>>): string[] {
  return [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
  ];
}

async function collectPublishableSourceFiles(
  relativePackagePath: string,
  currentDir = join(repoRoot, relativePackagePath, 'src'),
  files: string[] = [],
): Promise<string[]> {
  for (const entry of await readdir(currentDir, { withFileTypes: true })) {
    const path = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }

      await collectPublishableSourceFiles(relativePackagePath, path, files);
      continue;
    }

    if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(path);
    }
  }

  return files;
}

describe('package verification', () => {
  it('publishable packages have non-empty dist directories after build', async () => {
    for (const relativePackagePath of PUBLISHABLE_PACKAGES) {
      const packageJson = await readPackageJson(relativePackagePath);
      expect(packageJson.private).not.toBe(true);

      const distDir = join(repoRoot, relativePackagePath, 'dist');
      const entries = await readdir(distDir);
      expect(entries.length).toBeGreaterThan(0);
    }
  });

  it('package exports resolve to built files', async () => {
    for (const relativePackagePath of PUBLISHABLE_PACKAGES) {
      const packageJson = await readPackageJson(relativePackagePath);
      const packageDir = join(repoRoot, relativePackagePath);
      const exports = packageJson.exports ?? {};

      for (const entry of Object.values(exports)) {
        const exportEntry = typeof entry === 'string' ? { import: entry } : entry;
        if (exportEntry.import) {
          await assertPathExists(join(packageDir, exportEntry.import));
        }
        if (exportEntry.types) {
          await assertPathExists(join(packageDir, exportEntry.types));
        }
      }
    }
  });

  it('cli bin entry resolves to a bin script with a Node shebang', async () => {
    const packageJson = await readPackageJson('packages/cli');
    const binEntry = packageJson.bin?.envanalyser;
    expect(binEntry).toBe('bin/envanalyser.js');

    const binScriptPath = join(repoRoot, 'packages/cli', 'bin/envanalyser.js');
    await assertPathExists(binScriptPath);
    await assertPathExists(join(repoRoot, 'packages/cli', 'dist/index.js'));

    const binScript = await readFile(binScriptPath, 'utf8');
    expect(binScript.startsWith('#!/usr/bin/env node\n')).toBe(true);
  });

  it('preserves cli bin mapping in npm pack tarball', async () => {
    const cliDir = join(repoRoot, 'packages/cli');
    const tempDir = await mkdtemp(join(tmpdir(), 'envanalyser-cli-pack-test-'));

    try {
      const tarballName = execSync(`npm pack --pack-destination ${JSON.stringify(tempDir)}`, {
        cwd: cliDir,
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .at(-1)
        ?.trim();

      expect(tarballName).toBeTruthy();

      const tarballPath = join(tempDir, tarballName!);
      const packedPackageJson = JSON.parse(
        execSync(`tar -xOzf ${JSON.stringify(tarballPath)} package/package.json`, {
          encoding: 'utf8',
        }),
      );

      expect(packedPackageJson.bin).toEqual({ envanalyser: 'bin/envanalyser.js' });

      const packedBinScript = execSync(
        `tar -xOzf ${JSON.stringify(tarballPath)} package/bin/envanalyser.js`,
        { encoding: 'utf8' },
      );
      expect(packedBinScript.startsWith('#!/usr/bin/env node\n')).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('does not strip cli bin during npm publish dry-run', () => {
    const output = execSync('npm publish --dry-run', {
      cwd: join(repoRoot, 'packages/cli'),
      encoding: 'utf8',
    });

    expect(output).not.toContain('script name');
    expect(output).not.toContain('was invalid and removed');
  });
});

describe('package rename validation', () => {
  it('uses expected package names across workspace packages', async () => {
    for (const relativePackagePath of WORKSPACE_PACKAGES) {
      const packageJson = await readPackageJson(relativePackagePath);
      expect(packageJson.name).toBe(EXPECTED_PACKAGE_NAMES[relativePackagePath]);
    }
  });

  it('does not reference @envaudit in publishable package.json files', async () => {
    for (const relativePackagePath of PUBLISHABLE_PACKAGES) {
      const raw = await readFile(join(repoRoot, relativePackagePath, 'package.json'), 'utf8');
      expect(raw).not.toContain('@envaudit');
    }
  });

  it('does not reference envaudit- in publishable package.json files', async () => {
    for (const relativePackagePath of PUBLISHABLE_PACKAGES) {
      const raw = await readFile(join(repoRoot, relativePackagePath, 'package.json'), 'utf8');
      expect(raw).not.toContain('envaudit-');
    }
  });

  it('does not reference @envdoctor in any workspace package.json', async () => {
    for (const relativePackagePath of WORKSPACE_PACKAGES) {
      const raw = await readFile(join(repoRoot, relativePackagePath, 'package.json'), 'utf8');
      expect(raw).not.toContain('@envdoctor');
    }
  });

  it('does not use @envaudit scoped dependencies in publishable packages', async () => {
    for (const relativePackagePath of PUBLISHABLE_PACKAGES) {
      const packageJson = await readPackageJson(relativePackagePath);
      for (const dependencyName of collectDependencyNames(packageJson)) {
        expect(dependencyName.startsWith('@envaudit/')).toBe(false);
      }
    }
  });

  it('names the CLI binary envanalyser', async () => {
    const packageJson = await readPackageJson('packages/cli');
    expect(Object.keys(packageJson.bin ?? {})).toEqual(['envanalyser']);
  });
});

describe('publishable rename guard', () => {
  it('does not contain legacy @envaudit or envaudit- references in publishable source', async () => {
    for (const relativePackagePath of PUBLISHABLE_PACKAGES) {
      const packageJsonRaw = await readFile(
        join(repoRoot, relativePackagePath, 'package.json'),
        'utf8',
      );

      for (const pattern of FORBIDDEN_PUBLISHABLE_PATTERNS) {
        expect(packageJsonRaw).not.toMatch(pattern);
      }

      const sourceFiles = await collectPublishableSourceFiles(relativePackagePath);
      expect(sourceFiles.length).toBeGreaterThan(0);

      for (const sourceFile of sourceFiles) {
        const contents = await readFile(sourceFile, 'utf8');
        for (const pattern of FORBIDDEN_PUBLISHABLE_PATTERNS) {
          expect(contents, sourceFile).not.toMatch(pattern);
        }
      }
    }
  });
});
