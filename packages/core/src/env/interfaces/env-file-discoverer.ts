import type { WorkspaceProject } from '@envdoctor/contracts';

export interface EnvFileDiscoverer {
  discover(project: WorkspaceProject): Promise<string[]>;
}
