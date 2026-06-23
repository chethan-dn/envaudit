import { createScanOrchestrator } from '@envdoctor/core';
import { BuiltinPluginRegistry } from '@envdoctor/plugins';
import { ScanCommandHandler } from './handlers/scan-command-handler.js';
import { createScanReporter } from './reporters/create-scan-reporter.js';

export function createScanCommandHandler(): ScanCommandHandler {
  const plugins = new BuiltinPluginRegistry().getPlugins();
  const orchestrator = createScanOrchestrator(plugins);

  return new ScanCommandHandler({
    orchestrator,
    createReporter: (options) => createScanReporter(options),
  });
}
