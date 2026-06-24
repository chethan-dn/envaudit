import type { ScanMetrics, VariableDefinition, VariableUsage, WorkspaceProject } from 'envaudit-contracts';
import type { ScannerPlugin } from 'envaudit-contracts';

export interface PluginScanFailure {
  pluginId: string;
  projectRootPath: string;
  message: string;
}

export interface PluginScanOutcome {
  usages: VariableUsage[];
  definitions: VariableDefinition[];
  failures: PluginScanFailure[];
  sourceMetrics: ScanMetrics;
}

export interface PluginScanService {
  scanProject(project: WorkspaceProject, plugins: ScannerPlugin[]): Promise<PluginScanOutcome>;
}
