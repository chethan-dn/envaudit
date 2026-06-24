import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createScanOrchestrator } from 'envaudit-core';
import { getBuiltinPlugins } from '../builtins/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('nestjs config wrapper integration', () => {
  it('counts wrapper property access as usage of the underlying env variable', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('nestjs-config-wrapper'),
    );
    const scanResult = result.results[0];

    expect(scanResult?.usages.map((usage) => usage.name).sort()).toEqual([
      'DATABASE_URL',
      'DATABASE_URL',
      'OPENAI_API_KEY',
      'OPENAI_API_KEY',
    ]);
    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_UNUSED' && issue.variable === 'DATABASE_URL',
      ),
    ).toEqual([]);
    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_UNUSED' && issue.variable === 'OPENAI_API_KEY',
      ),
    ).toEqual([]);
  });
});
