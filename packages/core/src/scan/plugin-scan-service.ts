import type { ScanMetrics, VariableDefinition } from '@envdoctor/contracts';
import type { ScannerPlugin } from '@envdoctor/contracts';
import type { VariableUsage, WorkspaceProject } from '@envdoctor/contracts';
import type {
  PluginScanFailure,
  PluginScanOutcome,
  PluginScanService,
} from './interfaces/plugin-scan-service.js';
import {
  isSourceScanMetricsProvider,
} from './interfaces/source-scan-metrics-provider.js';

export class DefaultPluginScanService implements PluginScanService {
  async scanProject(project: WorkspaceProject, plugins: ScannerPlugin[]): Promise<PluginScanOutcome> {
    const usages: VariableUsage[] = [];
    const definitions: VariableDefinition[] = [];
    const failures: PluginScanFailure[] = [];
    const sourceMetrics: ScanMetrics = {
      scannedFileCount: 0,
      skippedFileCount: 0,
    };

    for (const plugin of plugins) {
      try {
        if (!(await plugin.detect(project.rootPath))) {
          continue;
        }

        usages.push(...(await plugin.scan(project.rootPath)));

        if (plugin.discoverDefinitions) {
          definitions.push(...(await plugin.discoverDefinitions(project.rootPath)));
        }

        if (isSourceScanMetricsProvider(plugin)) {
          const metrics = plugin.getSourceScanMetrics();
          sourceMetrics.scannedFileCount += metrics.scannedFileCount;
          sourceMetrics.skippedFileCount += metrics.skippedFileCount;
        }
      } catch (error) {
        failures.push({
          pluginId: plugin.id,
          projectRootPath: project.rootPath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { usages, definitions, failures, sourceMetrics };
  }
}
