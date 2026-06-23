import type { Command } from 'commander';

export function registerScanCommand(program: Command): void {
  program
    .command('scan')
    .description('Scan a repository for environment variable issues')
    .action(() => {
      console.log('scan: not implemented yet');
    });
}
