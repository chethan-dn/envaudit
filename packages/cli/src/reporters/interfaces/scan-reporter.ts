import type { RepositoryScanResult } from 'envanalyser-core';

export interface ScanReporter {
  render(result: RepositoryScanResult): string;
}
