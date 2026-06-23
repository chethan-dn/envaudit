import type { VariableDefinition, WorkspaceProject } from '@envdoctor/contracts';

export interface EnvDiscoveryService {
  discoverForProject(project: WorkspaceProject): Promise<VariableDefinition[]>;
  discoverForProjects(projects: WorkspaceProject[]): Promise<VariableDefinition[]>;
}
