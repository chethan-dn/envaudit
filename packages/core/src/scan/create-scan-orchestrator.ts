import { createEnvDiscoveryService } from '../env/create-env-discovery-service.js';
import { createIssueAnalysisService } from '../analysis/create-issue-analysis-service.js';
import {
  createDefaultProjectDiscoveryDependencies,
  createProjectDiscoveryService,
} from '../workspace/create-project-discovery-service.js';
import { WorkspaceRootResolver } from '../workspace/workspace-root-resolver.js';
import { DefaultEnvAnalyserConfigLoader } from '../config/envanalyser-config-loader.js';
import { DefaultPluginScanService } from './plugin-scan-service.js';
import {
  DefaultScanOrchestrator,
  type PluginFactory,
  type ScanOrchestratorDependencies,
} from './scan-orchestrator.js';
import type { ScanOrchestrator } from './interfaces/scan-orchestrator.js';

export function createDefaultScanOrchestratorDependencies(
  createPlugins: PluginFactory,
): ScanOrchestratorDependencies {
  const projectDiscoveryDeps = createDefaultProjectDiscoveryDependencies();

  return {
    configLoader: new DefaultEnvAnalyserConfigLoader(),
    projectDiscovery: createProjectDiscoveryService(),
    workspaceRootResolver: new WorkspaceRootResolver({
      fileSystem: projectDiscoveryDeps.fileSystem,
      workspaceDetectors: projectDiscoveryDeps.workspaceDetectors,
    }),
    envDiscovery: createEnvDiscoveryService(),
    issueAnalysis: createIssueAnalysisService(),
    pluginScan: new DefaultPluginScanService(),
    createPlugins,
  };
}

export function createScanOrchestrator(
  createPlugins: PluginFactory,
  deps?: Partial<Omit<ScanOrchestratorDependencies, 'createPlugins'>>,
): ScanOrchestrator {
  const defaults = createDefaultScanOrchestratorDependencies(createPlugins);

  return new DefaultScanOrchestrator({
    configLoader: deps?.configLoader ?? defaults.configLoader,
    projectDiscovery: deps?.projectDiscovery ?? defaults.projectDiscovery,
    workspaceRootResolver: deps?.workspaceRootResolver ?? defaults.workspaceRootResolver,
    envDiscovery: deps?.envDiscovery ?? defaults.envDiscovery,
    issueAnalysis: deps?.issueAnalysis ?? defaults.issueAnalysis,
    pluginScan: deps?.pluginScan ?? defaults.pluginScan,
    createPlugins,
  });
}
