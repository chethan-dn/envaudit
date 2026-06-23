import type { RepositoryScanResult } from '@envdoctor/core';
import type { ScanReporter } from './interfaces/scan-reporter.js';

export class JsonScanReporter implements ScanReporter {
  render(result: RepositoryScanResult): string {
    return `${JSON.stringify(result, null, 2)}\n`;
  }
}
