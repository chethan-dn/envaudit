import { createEnvDiscoveryService } from '../env/create-env-discovery-service.js';
import { createIssueAnalysisService } from '../analysis/create-issue-analysis-service.js';
import { createProjectDiscoveryService } from '../workspace/create-project-discovery-service.js';
import { DefaultPluginScanService } from './plugin-scan-service.js';
import { DefaultScanOrchestrator, type ScanOrchestratorDependencies } from './scan-orchestrator.js';
import type { ScanOrchestrator } from './interfaces/scan-orchestrator.js';

export function createDefaultScanOrchestratorDependencies(
  plugins: ScanOrchestratorDependencies['plugins'],
): ScanOrchestratorDependencies {
  return {
    projectDiscovery: createProjectDiscoveryService(),
    envDiscovery: createEnvDiscoveryService(),
    issueAnalysis: createIssueAnalysisService(),
    pluginScan: new DefaultPluginScanService(),
    plugins,
  };
}

export function createScanOrchestrator(
  plugins: ScanOrchestratorDependencies['plugins'],
  deps?: Partial<Omit<ScanOrchestratorDependencies, 'plugins'>>,
): ScanOrchestrator {
  const defaults = createDefaultScanOrchestratorDependencies(plugins);

  return new DefaultScanOrchestrator({
    projectDiscovery: deps?.projectDiscovery ?? defaults.projectDiscovery,
    envDiscovery: deps?.envDiscovery ?? defaults.envDiscovery,
    issueAnalysis: deps?.issueAnalysis ?? defaults.issueAnalysis,
    pluginScan: deps?.pluginScan ?? defaults.pluginScan,
    plugins,
  });
}
