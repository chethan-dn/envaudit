import type { ScanReporter } from './interfaces/scan-reporter.js';
import { HumanScanReporter } from './human-scan-reporter.js';
import { JsonScanReporter } from './json-scan-reporter.js';

export interface ScanReporterOptions {
  json: boolean;
}

export function createScanReporter(options: ScanReporterOptions): ScanReporter {
  if (options.json) {
    return new JsonScanReporter();
  }

  return new HumanScanReporter();
}
