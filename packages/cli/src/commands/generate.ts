import type { Command } from 'commander';

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate environment configuration files')
    .action(() => {
      console.log('generate: not implemented yet');
    });
}
