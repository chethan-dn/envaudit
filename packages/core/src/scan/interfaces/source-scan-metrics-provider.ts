import type { ScanMetrics } from '@envdoctor/contracts';
import type { ScannerPlugin } from '@envdoctor/contracts';

export interface SourceScanMetricsProvider {
  getSourceScanMetrics(): ScanMetrics;
}

export function isSourceScanMetricsProvider(
  plugin: ScannerPlugin,
): plugin is ScannerPlugin & SourceScanMetricsProvider {
  return 'getSourceScanMetrics' in plugin &&
    typeof (plugin as SourceScanMetricsProvider).getSourceScanMetrics === 'function';
}
