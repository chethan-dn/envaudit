import type { RepositoryScanResult } from '@envdoctor/contracts';
import type { ScanOptions } from './scan-options.js';

export interface ScanOrchestrator {
  scan(repositoryPath: string, options?: ScanOptions): Promise<RepositoryScanResult>;
}
