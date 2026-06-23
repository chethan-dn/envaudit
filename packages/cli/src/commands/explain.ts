import type { Command } from 'commander';

export function registerExplainCommand(program: Command): void {
  program
    .command('explain')
    .description('Explain how a variable is used')
    .argument('<variable>', 'Variable name to explain')
    .action((variable: string) => {
      console.log(`explain ${variable}: not implemented yet`);
    });
}
