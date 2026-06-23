import type { ProjectDiscoveryResult } from '@envdoctor/contracts';

export interface ProjectDiscoveryService {
  discover(rootPath: string): Promise<ProjectDiscoveryResult>;
}
