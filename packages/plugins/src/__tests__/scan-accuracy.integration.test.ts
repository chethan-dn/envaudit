import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createScanOrchestrator } from '@envaudit/core';
import { getBuiltinPlugins } from '../builtins/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('scan accuracy integration', () => {
  it('does not emit ENV_EMPTY for documentation env files in env-heavy', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('env-heavy'),
    );
    const scanResult = result.results[0];

    expect(scanResult?.issues.filter((issue) => issue.code === 'ENV_EMPTY')).toEqual([]);
    expect(
      scanResult?.definitions.filter(
        (definition) => definition.sourceFile.endsWith('.env.template'),
      ),
    ).not.toEqual([]);
  });

  it('does not satisfy ENV_MISSING using documentation definitions', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('runtime-vs-example'),
    );
    const scanResult = result.results[0];

    expect(scanResult?.issues.filter((issue) => issue.code === 'ENV_MISSING')).toEqual([
      expect.objectContaining({
        variable: 'API_KEY',
        code: 'ENV_MISSING',
      }),
    ]);
    expect(
      scanResult?.issues.some(
        (issue) => issue.code === 'ENV_MISSING' && issue.variable === 'DATABASE_URL',
      ),
    ).toBe(false);
  });

  it('honors custom excludes from .envaudit.json', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('envaudit-config'),
    );
    const scanResult = result.results[0];

    expect(scanResult?.usages.map((usage) => usage.name)).toEqual(['FOO']);
    expect(scanResult?.metrics.skippedFileCount).toBeGreaterThan(0);
  });

  it('aggregates scanned and skipped metrics in repository summary', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('full-stack-app'),
    );

    expect(result.summary.scannedFileCount).toBeGreaterThan(0);
    expect(result.results[0]?.metrics.scannedFileCount).toBeGreaterThan(0);
    expect(result.summary.scannedFileCount).toBe(result.results[0]?.metrics.scannedFileCount);
  });
});
