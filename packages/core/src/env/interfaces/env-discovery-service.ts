import type { EnvDoctorConfig, VariableDefinition, WorkspaceProject } from '@envdoctor/contracts';

export interface EnvDiscoveryService {
  discoverForProject(project: WorkspaceProject, config?: EnvDoctorConfig): Promise<VariableDefinition[]>;
  discoverForProjects(projects: WorkspaceProject[], config?: EnvDoctorConfig): Promise<VariableDefinition[]>;
}
