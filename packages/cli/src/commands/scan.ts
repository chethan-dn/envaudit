import type { Command } from 'commander';
import { createScanCommandHandler } from '../composition-root.js';
import { writeScanError } from '../errors/write-scan-error.js';
import type { ScanCommandHandler } from '../handlers/scan-command-handler.js';

export function registerScanCommand(
  program: Command,
  handler: ScanCommandHandler = createScanCommandHandler(),
): void {
  program
    .command('scan')
    .description('Scan a repository for environment variable issues')
    .argument('[path]', 'repository path')
    .option('--env <path>', 'use a specific runtime env file')
    .option('--json', 'output machine-readable JSON')
    .action(async (path: string | undefined, options: { json?: boolean; env?: string }) => {
      try {
        const exitCode = await handler.execute({
          path: path ?? process.cwd(),
          json: Boolean(options.json),
          env: options.env,
        });
        process.exitCode = exitCode;
      } catch (error) {
        writeScanError(error);
        process.exitCode = 2;
      }
    });
}
