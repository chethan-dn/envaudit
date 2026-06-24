import type { ProjectDiscoveryResult } from 'envanalyser-contracts';

export interface ProjectDiscoveryService {
  discover(rootPath: string): Promise<ProjectDiscoveryResult>;
}
