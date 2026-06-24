import type { EnvironmentFileSummary } from './environment-file-summary.js';
import type { Issue } from './issue.js';
import type { ScanMetrics } from './scan-metrics.js';
import type { VariableDefinition } from './variable-definition.js';
import type { VariableUsage } from './variable-usage.js';
import type { WorkspaceProject } from './workspace-project.js';

export interface ScanResult {
  project: WorkspaceProject;
  definitions: VariableDefinition[];
  usages: VariableUsage[];
  issues: Issue[];
  metrics: ScanMetrics;
  environmentFiles?: EnvironmentFileSummary;
}
