import { access, readdir, readFile } from 'node:fs/promises';
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

async function readPackageJson(relativePackagePath: string) {
  const packageJsonPath = join(repoRoot, relativePackagePath, 'package.json');
  const packageJson = await import(packageJsonPath, { with: { type: 'json' } });
  return packageJson.default as {
    name: string;
    private?: boolean;
    bin?: Record<string, string>;
    exports?: Record<string, { import?: string; types?: string } | string>;
    main?: string;
  };
}

async function assertPathExists(path: string): Promise<void> {
  await access(path);
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

  it('cli bin entry resolves to built executable', async () => {
    const packageJson = await readPackageJson('packages/cli');
    const binEntry = packageJson.bin?.envaudit;
    expect(binEntry).toBe('./dist/index.js');
    await assertPathExists(join(repoRoot, 'packages/cli', 'dist/index.js'));
  });
});

describe('package rename validation', () => {
  it('uses @envaudit package names across workspace packages', async () => {
    for (const relativePackagePath of WORKSPACE_PACKAGES) {
      const packageJson = await readPackageJson(relativePackagePath);
      expect(packageJson.name.startsWith('@envaudit/')).toBe(true);
    }
  });

  it('does not reference @envdoctor in any workspace package.json', async () => {
    for (const relativePackagePath of WORKSPACE_PACKAGES) {
      const raw = await readFile(join(repoRoot, relativePackagePath, 'package.json'), 'utf8');
      expect(raw).not.toContain('@envdoctor');
    }
  });

  it('names the CLI binary envaudit', async () => {
    const packageJson = await readPackageJson('packages/cli');
    expect(Object.keys(packageJson.bin ?? {})).toEqual(['envaudit']);
  });
});
