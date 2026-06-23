import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { ScannerPlugin } from '@envdoctor/contracts';
import { createScanOrchestrator } from '../create-scan-orchestrator.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('scan orchestrator integration', () => {
  it('scans full-stack-app with a stub plugin and produces expected issues', async () => {
    const projectRootPath = fixturePath('full-stack-app');
    const plugin: ScannerPlugin = {
      id: 'stub',
      name: 'Stub',
      detect: vi.fn().mockResolvedValue(true),
      scan: vi.fn().mockResolvedValue([
        {
          name: 'DATABASE_URL',
          sourceFile: resolve(projectRootPath, 'src/app.ts'),
          projectRootPath,
          line: 1,
          confidence: 'high',
          usageType: 'env',
        },
        {
          name: 'JWT_SECRET',
          sourceFile: resolve(projectRootPath, 'src/app.ts'),
          projectRootPath,
          line: 2,
          confidence: 'high',
          usageType: 'env',
        },
        {
          name: 'MISSING_FEATURE_FLAG',
          sourceFile: resolve(projectRootPath, 'src/app.ts'),
          projectRootPath,
          line: 3,
          confidence: 'high',
          usageType: 'env',
        },
      ]),
    };

    const result = await createScanOrchestrator([plugin]).scan(projectRootPath);
    const scanResult = result.results[0];

    expect(result.summary.projectCount).toBe(1);
    expect(scanResult?.definitions.length).toBeGreaterThan(0);
    expect(scanResult?.usages).toHaveLength(3);

    const issueCodes = scanResult?.issues.map((issue) => issue.code).sort();
    expect(issueCodes).toEqual([
      'ENV_DUPLICATE',
      'ENV_EMPTY',
      'ENV_MISSING',
      'ENV_UNUSED',
      'ENV_UNUSED',
      'ENV_UNUSED',
    ]);

    expect(scanResult?.issues.some((issue) => issue.code === 'ENV_MISSING' && issue.variable === 'MISSING_FEATURE_FLAG')).toBe(true);
    expect(scanResult?.issues.filter((issue) => issue.code === 'ENV_UNUSED' && issue.variable === 'UNUSED_API_KEY')).toHaveLength(1);
    expect(scanResult?.issues.filter((issue) => issue.code === 'ENV_DUPLICATE' && issue.variable === 'PORT')).toHaveLength(1);
    expect(scanResult?.issues.filter((issue) => issue.code === 'ENV_EMPTY' && issue.variable === 'LOG_LEVEL')).toHaveLength(1);
    expect(scanResult?.issues.filter((issue) => issue.variable === 'DATABASE_URL')).toEqual([]);
    expect(scanResult?.issues.filter((issue) => issue.variable === 'JWT_SECRET')).toEqual([]);
  });
});
