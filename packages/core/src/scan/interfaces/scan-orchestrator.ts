import type { RepositoryScanResult } from '@envdoctor/contracts';

export interface ScanOrchestrator {
  scan(repositoryPath: string): Promise<RepositoryScanResult>;
}
