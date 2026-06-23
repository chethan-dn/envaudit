import type { ScanMetrics, VariableUsage, WorkspaceProject } from '@envdoctor/contracts';
import type { ScannerPlugin } from '@envdoctor/contracts';

export interface PluginScanFailure {
  pluginId: string;
  projectRootPath: string;
  message: string;
}

export interface PluginScanOutcome {
  usages: VariableUsage[];
  failures: PluginScanFailure[];
  sourceMetrics: ScanMetrics;
}

export interface PluginScanService {
  scanProject(project: WorkspaceProject, plugins: ScannerPlugin[]): Promise<PluginScanOutcome>;
}
