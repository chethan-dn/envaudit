import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createTypeScriptScannerPlugin } from '../create-typescript-scanner-plugin.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('TypeScriptScannerPlugin integration', () => {
  const plugin = createTypeScriptScannerPlugin();

  it('detects supported source files in typescript-usage fixture', async () => {
    const rootPath = fixturePath('typescript-usage');

    await expect(plugin.detect(rootPath)).resolves.toBe(true);
  });

  it('scans process.env usages from typescript-usage fixture', async () => {
    const rootPath = fixturePath('typescript-usage');
    const usages = await plugin.scan(rootPath);

    expect(usages).toEqual([
      {
        name: 'DATABASE_URL',
        sourceFile: resolve(rootPath, 'src/app.ts'),
        projectRootPath: rootPath,
        line: 1,
        confidence: 'high',
        usageType: 'env',
      },
      {
        name: 'JWT_SECRET',
        sourceFile: resolve(rootPath, 'src/app.ts'),
        projectRootPath: rootPath,
        line: 2,
        confidence: 'high',
        usageType: 'env',
      },
      {
        name: 'REDIS_URL',
        sourceFile: resolve(rootPath, 'src/cache.ts'),
        projectRootPath: rootPath,
        line: 1,
        confidence: 'high',
        usageType: 'env',
      },
    ]);
  });

  it('returns false for single-js fixture without source files', async () => {
    const rootPath = fixturePath('single-js');

    await expect(plugin.detect(rootPath)).resolves.toBe(false);
    await expect(plugin.scan(rootPath)).resolves.toEqual([]);
  });
});
