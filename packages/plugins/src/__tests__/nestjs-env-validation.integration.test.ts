import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createScanOrchestrator } from '@envdoctor/core';
import { getBuiltinPlugins } from '../builtins/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('nestjs env validation integration', () => {
  it('reports ENV_UNCONFIGURED for schema-declared variables missing from runtime env files', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('nestjs-env-validation'),
    );
    const scanResult = result.results[0];

    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_MISSING' && issue.variable === 'DATABASE_URL',
      ),
    ).toEqual([]);
    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_UNCONFIGURED' && issue.variable === 'DATABASE_URL',
      ),
    ).toEqual([
      expect.objectContaining({
        code: 'ENV_UNCONFIGURED',
        variable: 'DATABASE_URL',
        schemaFile: expect.stringContaining('env.validation.ts'),
      }),
    ]);
    expect(
      scanResult?.issues.filter(
        (issue) => issue.code === 'ENV_UNCONFIGURED' && issue.variable === 'OPENAI_API_KEY',
      ),
    ).toHaveLength(1);
  });

  it('does not report issues for schema variables configured in runtime env files', async () => {
    const result = await createScanOrchestrator((policy) => getBuiltinPlugins(policy)).scan(
      fixturePath('nestjs-env-validation-configured'),
    );
    const scanResult = result.results[0];

    expect(
      scanResult?.issues.filter((issue) => issue.variable === 'DATABASE_URL'),
    ).toEqual([]);
  });
});
