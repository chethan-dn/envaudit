import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createScanOrchestrator } from '@envdoctor/core';
import { BuiltinPluginRegistry } from '../plugin-registry.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('scan orchestrator pipeline integration', () => {
  it('scans full-stack-app with builtin plugins', async () => {
    const repositoryPath = fixturePath('full-stack-app');
    const result = await createScanOrchestrator((policy) =>
      new BuiltinPluginRegistry().getPlugins(policy),
    ).scan(repositoryPath);
    const scanResult = result.results[0];

    expect(result.summary).toMatchObject({
      projectCount: 1,
      definitionCount: 6,
      usageCount: 3,
      issueCount: 6,
    });
    expect(result.summary.scannedFileCount).toBeGreaterThan(0);
    expect(result.summary.skippedFileCount).toBeGreaterThanOrEqual(0);

    expect(scanResult?.usages.map((usage) => usage.name).sort()).toEqual([
      'DATABASE_URL',
      'JWT_SECRET',
      'MISSING_FEATURE_FLAG',
    ]);

    const issueCodes = scanResult?.issues.map((issue) => issue.code).sort();
    expect(issueCodes).toEqual([
      'ENV_DUPLICATE',
      'ENV_EMPTY',
      'ENV_MISSING',
      'ENV_UNUSED',
      'ENV_UNUSED',
      'ENV_UNUSED',
    ]);
  });

  it('scans pnpm-monorepo as isolated projects', async () => {
    const repositoryPath = fixturePath('pnpm-monorepo');
    const result = await createScanOrchestrator((policy) =>
      new BuiltinPluginRegistry().getPlugins(policy),
    ).scan(repositoryPath);

    expect(result.summary.projectCount).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(new Set(result.results.map((entry) => entry.project.rootPath)).size).toBe(2);
  });
});
