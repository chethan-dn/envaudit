import type { WorkspaceProject } from 'envaudit-contracts';

export interface EnvFileDiscoverer {
  discover(project: WorkspaceProject): Promise<string[]>;
}
