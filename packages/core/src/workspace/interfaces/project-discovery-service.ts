import type { ProjectDiscoveryResult } from '@envaudit/contracts';

export interface ProjectDiscoveryService {
  discover(rootPath: string): Promise<ProjectDiscoveryResult>;
}
