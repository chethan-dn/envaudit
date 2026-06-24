import type { WorkspaceProject } from 'envanalyser-contracts';

export interface EnvFileDiscoverer {
  discover(project: WorkspaceProject): Promise<string[]>;
}
