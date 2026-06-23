import { access } from 'node:fs/promises';
import type { ScanOrchestrator } from '@envdoctor/core';
import type { ScanReporter } from '../reporters/interfaces/scan-reporter.js';
import type { ScanCommandOptions } from './scan-command-options.js';

export interface ScanCommandHandlerDependencies {
  orchestrator: ScanOrchestrator;
  createReporter: (options: Pick<ScanCommandOptions, 'json'>) => ScanReporter;
  stdout?: NodeJS.WritableStream;
}

export class ScanCommandHandler {
  private readonly orchestrator: ScanOrchestrator;
  private readonly createReporter: (options: Pick<ScanCommandOptions, 'json'>) => ScanReporter;
  private readonly stdout: NodeJS.WritableStream;

  constructor(deps: ScanCommandHandlerDependencies) {
    this.orchestrator = deps.orchestrator;
    this.createReporter = deps.createReporter;
    this.stdout = deps.stdout ?? process.stdout;
  }

  async execute(options: ScanCommandOptions): Promise<number> {
    await this.assertRepositoryPath(options.path);

    const result = await this.orchestrator.scan(options.path);
    const reporter = this.createReporter({ json: options.json });
    const output = reporter.render(result);
    this.stdout.write(output);

    return result.summary.issueCount > 0 ? 1 : 0;
  }

  private async assertRepositoryPath(path: string): Promise<void> {
    try {
      await access(path);
    } catch {
      throw new Error(`Path not found: ${path}`);
    }
  }
}
