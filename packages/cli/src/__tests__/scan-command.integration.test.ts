import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { createScanOrchestrator } from '@envdoctor/core';
import { getBuiltinPlugins } from '@envdoctor/plugins';
import { registerScanCommand } from '../commands/scan.js';
import { ScanCommandHandler } from '../handlers/scan-command-handler.js';
import { createScanReporter } from '../reporters/create-scan-reporter.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

function createHandler(stdout: NodeJS.WritableStream): ScanCommandHandler {
  return new ScanCommandHandler({
    orchestrator: createScanOrchestrator((policy) => getBuiltinPlugins(policy)),
    createReporter: (options) => createScanReporter(options),
    stdout,
  });
}

describe('scan command integration', () => {
  it('scans full-stack-app and reports issues through the handler', async () => {
    const chunks: string[] = [];
    const stdout = {
      write(chunk: string) {
        chunks.push(chunk);
      },
    } as NodeJS.WritableStream;

    const handler = createHandler(stdout);

    const exitCode = await handler.execute({
      path: fixturePath('full-stack-app'),
      json: false,
    });

    const output = chunks.join('');

    expect(exitCode).toBe(1);
    expect(output).toContain('ENV_MISSING');
    expect(output).toContain('MISSING_FEATURE_FLAG');
    expect(output).toContain('Definitions:');
    expect(output).toContain('Usages:');
    expect(output).toContain('Issues:');
    expect(output).toContain('Scanned:');
    expect(output).toContain('Skipped:');
  });

  it('outputs RepositoryScanResult JSON with --json', async () => {
    const chunks: string[] = [];
    const stdout = {
      write(chunk: string) {
        chunks.push(chunk);
      },
    } as NodeJS.WritableStream;

    const handler = createHandler(stdout);

    const exitCode = await handler.execute({
      path: fixturePath('full-stack-app'),
      json: true,
    });

    const parsed = JSON.parse(chunks.join(''));

    expect(exitCode).toBe(1);
    expect(parsed.summary).toEqual({
      projectCount: 1,
      definitionCount: 6,
      usageCount: 3,
      issueCount: 6,
      scannedFileCount: expect.any(Number),
      skippedFileCount: expect.any(Number),
    });
  });

  it('registers commander action with parsed options', async () => {
    const handler = {
      execute: vi.fn().mockResolvedValue(0),
    } as unknown as ScanCommandHandler;

    const program = new Command();
    registerScanCommand(program, handler);

    await program.parseAsync(['node', 'envdoctor', 'scan', fixturePath('full-stack-app'), '--json']);

    expect(handler.execute).toHaveBeenCalledWith({
      path: fixturePath('full-stack-app'),
      json: true,
    });
  });
});
