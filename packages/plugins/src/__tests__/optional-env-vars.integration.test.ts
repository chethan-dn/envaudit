import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createScanOrchestrator } from '@envaudit/core';
import { getBuiltinPlugins } from '../builtins/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('optional environment variable integration', () => {
  it('reports ENV_OPTIONAL for configService.get with defaults and no issue for defined variables', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('optional-env-vars'),
    );
    const scanResult = result.results[0];

    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_MISSING' && issue.variable === 'THROTTLE_TTL',
      ),
    ).toEqual([]);
    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_OPTIONAL' && issue.variable === 'THROTTLE_TTL',
      ),
    ).toEqual([
      expect.objectContaining({
        code: 'ENV_OPTIONAL',
        variable: 'THROTTLE_TTL',
        defaultValue: '60',
      }),
    ]);
    expect(
      scanResult?.issues.filter((issue) => issue.variable === 'DATABASE_URL'),
    ).toEqual([]);
  });
});
