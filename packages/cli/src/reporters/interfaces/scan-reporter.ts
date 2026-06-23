import type { RepositoryScanResult } from '@envdoctor/core';

export interface ScanReporter {
  render(result: RepositoryScanResult): string;
}
