import type { RepositoryScanResult } from 'envaudit-core';

export interface ScanReporter {
  render(result: RepositoryScanResult): string;
}
