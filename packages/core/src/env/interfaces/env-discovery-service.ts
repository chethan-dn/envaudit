import type { EnvAnalyserConfig, WorkspaceProject } from 'envanalyser-contracts';
import type { EnvDiscoveryResult } from './env-discovery-result.js';

export interface EnvDiscoveryProjectOptions {
  config?: EnvAnalyserConfig;
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
