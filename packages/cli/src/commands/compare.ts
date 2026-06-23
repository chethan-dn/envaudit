import type { Command } from 'commander';

export function registerCompareCommand(program: Command): void {
  program
    .command('compare')
    .description('Compare environment variables across environments')
    .action(() => {
      console.log('compare: not implemented yet');
    });
}
