import { createScanOrchestrator } from '@envdoctor/core';
import { getBuiltinPlugins } from '@envdoctor/plugins';
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
