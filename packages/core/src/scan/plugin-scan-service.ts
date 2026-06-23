import type { VariableUsage, WorkspaceProject } from '@envdoctor/contracts';
import type { ScannerPlugin } from '@envdoctor/contracts';
import type {
  PluginScanFailure,
  PluginScanOutcome,
  PluginScanService,
} from './interfaces/plugin-scan-service.js';

export class DefaultPluginScanService implements PluginScanService {
  async scanProject(project: WorkspaceProject, plugins: ScannerPlugin[]): Promise<PluginScanOutcome> {
    const usages: VariableUsage[] = [];
    const failures: PluginScanFailure[] = [];

    for (const plugin of plugins) {
      try {
        if (!(await plugin.detect(project.rootPath))) {
          continue;
        }

        usages.push(...(await plugin.scan(project.rootPath)));
      } catch (error) {
        failures.push({
          pluginId: plugin.id,
          projectRootPath: project.rootPath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { usages, failures };
  }
}
