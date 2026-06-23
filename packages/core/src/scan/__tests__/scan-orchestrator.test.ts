import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ScannerPlugin } from '@envdoctor/contracts';
import { DefaultScanOrchestrator } from '../scan-orchestrator.js';
import { DefaultPluginScanService } from '../plugin-scan-service.js';
import { createEnvDiscoveryService } from '../../env/create-env-discovery-service.js';
import { createIssueAnalysisService } from '../../analysis/create-issue-analysis-service.js';
import { createProjectDiscoveryService } from '../../workspace/create-project-discovery-service.js';

describe('DefaultScanOrchestrator', () => {
  it('produces scan results for each discovered project', async () => {
    const plugin: ScannerPlugin = {
      id: 'test',
      name: 'Test',
      detect: vi.fn().mockResolvedValue(true),
      scan: vi.fn().mockResolvedValue([]),
    };

    const orchestrator = new DefaultScanOrchestrator({
      projectDiscovery: createProjectDiscoveryService(),
      envDiscovery: createEnvDiscoveryService(),
      issueAnalysis: createIssueAnalysisService(),
      pluginScan: new DefaultPluginScanService(),
      plugins: [plugin],
    });

    const repositoryPath = resolve(
      import.meta.dirname,
      '../../../../../fixtures/single-ts',
    );
    const result = await orchestrator.scan(repositoryPath);

    expect(result.rootPath).toBe(repositoryPath);
    expect(result.results).toHaveLength(1);
    expect(result.summary).toEqual({
      projectCount: 1,
      definitionCount: 0,
      usageCount: 0,
      issueCount: 0,
    });
  });
});
