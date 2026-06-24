import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ScannerPlugin } from '@envdoctor/contracts';
import { DefaultEnvDoctorConfigLoader } from '../../config/envdoctor-config-loader.js';
import { createEnvDiscoveryService } from '../../env/create-env-discovery-service.js';
import { createIssueAnalysisService } from '../../analysis/create-issue-analysis-service.js';
import { createProjectDiscoveryService, createDefaultProjectDiscoveryDependencies } from '../../workspace/create-project-discovery-service.js';
import { WorkspaceRootResolver } from '../../workspace/workspace-root-resolver.js';
import { DefaultScanOrchestrator } from '../scan-orchestrator.js';
import { DefaultPluginScanService } from '../plugin-scan-service.js';

describe('DefaultScanOrchestrator', () => {
  it('produces scan results for each discovered project', async () => {
    const plugin: ScannerPlugin = {
      id: 'test',
      name: 'Test',
      detect: vi.fn().mockResolvedValue(true),
      scan: vi.fn().mockResolvedValue([]),
    };

    const projectDiscoveryDeps = createDefaultProjectDiscoveryDependencies();
    const orchestrator = new DefaultScanOrchestrator({
      configLoader: new DefaultEnvDoctorConfigLoader(),
      projectDiscovery: createProjectDiscoveryService(),
      workspaceRootResolver: new WorkspaceRootResolver({
        fileSystem: projectDiscoveryDeps.fileSystem,
        workspaceDetectors: projectDiscoveryDeps.workspaceDetectors,
      }),
      envDiscovery: createEnvDiscoveryService(),
      issueAnalysis: createIssueAnalysisService(),
      pluginScan: new DefaultPluginScanService(),
      createPlugins: () => [plugin],
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
      scannedFileCount: 0,
      skippedFileCount: 0,
    });
    expect(result.results[0]?.metrics).toEqual({
      scannedFileCount: 0,
      skippedFileCount: 0,
    });
  });
});
