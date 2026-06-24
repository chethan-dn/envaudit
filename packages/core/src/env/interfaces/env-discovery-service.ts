import type { EnvDoctorConfig, WorkspaceProject } from '@envdoctor/contracts';
import type { EnvDiscoveryResult } from './env-discovery-result.js';

export interface EnvDiscoveryProjectOptions {
  config?: EnvDoctorConfig;
  workspaceRootPath?: string;
  runtimeEnvOverridePath?: string;
}

export interface EnvDiscoveryService {
  discoverForProject(
    project: WorkspaceProject,
    options?: EnvDiscoveryProjectOptions,
  ): Promise<EnvDiscoveryResult>;
  discoverForProjects(
    projects: WorkspaceProject[],
    options?: EnvDiscoveryProjectOptions,
  ): Promise<EnvDiscoveryResult[]>;
}
