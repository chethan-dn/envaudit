import { createScanOrchestrator } from 'envaudit-core';
import { getBuiltinPlugins } from 'envaudit-plugins';
import { ScanCommandHandler } from './handlers/scan-command-handler.js';
import { createScanReporter } from './reporters/create-scan-reporter.js';

export function createScanCommandHandler(): ScanCommandHandler {
  const orchestrator = createScanOrchestrator((exclusionPolicy) =>
    getBuiltinPlugins(exclusionPolicy),
  );

  return new ScanCommandHandler({
    orchestrator,
    createReporter: (options) => createScanReporter(options),
  });
}
