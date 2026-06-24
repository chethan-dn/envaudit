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
      issueCount: 5,
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
      env: undefined,
    });
  });

  it('scans root-env-monorepo nested project with workspace root env files', async () => {
    const chunks: string[] = [];
    const stdout = {
      write(chunk: string) {
        chunks.push(chunk);
      },
    } as NodeJS.WritableStream;

    const handler = createHandler(stdout);
    const projectPath = fixturePath('root-env-monorepo/apps/service');

    const exitCode = await handler.execute({
      path: projectPath,
      json: true,
    });

    const parsed = JSON.parse(chunks.join(''));
    const scanResult = parsed.results[0];

    expect(exitCode).toBe(0);
    expect(scanResult.environmentFiles.runtime).toContain(fixturePath('root-env-monorepo/.env'));
    expect(scanResult.environmentFiles.documentation).toContain(
      fixturePath('root-env-monorepo/apps/service/.env.example'),
    );
    expect(
      scanResult.issues.filter((issue: { code: string; variable: string }) => issue.code === 'ENV_MISSING'),
    ).toEqual([]);
    expect(scanResult.definitions).toContainEqual(
      expect.objectContaining({
        name: 'DATABASE_URL',
        value: 'postgres://localhost:5432/root',
        sourceFile: fixturePath('root-env-monorepo/.env'),
      }),
    );
  });

  it('uses only the override runtime env file with --env', async () => {
    const chunks: string[] = [];
    const stdout = {
      write(chunk: string) {
        chunks.push(chunk);
      },
    } as NodeJS.WritableStream;

    const handler = createHandler(stdout);
    const projectPath = fixturePath('explicit-env-override');

    const exitCode = await handler.execute({
      path: projectPath,
      json: true,
      env: resolve(projectPath, '.env.prod'),
    });

    const parsed = JSON.parse(chunks.join(''));
    const scanResult = parsed.results[0];

    expect(exitCode).toBe(0);
    expect(scanResult.environmentFiles.runtime).toEqual([resolve(projectPath, '.env.prod')]);
    expect(scanResult.definitions).toContainEqual(
      expect.objectContaining({
        name: 'PORT',
        value: '4000',
        sourceFile: resolve(projectPath, '.env.prod'),
      }),
    );
    expect(scanResult.issues.filter((issue: { code: string }) => issue.code === 'ENV_MISSING')).toEqual([]);
  });

  it('registers commander action with env override option', async () => {
    const handler = {
      execute: vi.fn().mockResolvedValue(0),
    } as unknown as ScanCommandHandler;

    const program = new Command();
    registerScanCommand(program, handler);

    await program.parseAsync([
      'node',
      'envdoctor',
      'scan',
      fixturePath('explicit-env-override'),
      '--env',
      '.env.prod',
      '--json',
    ]);

    expect(handler.execute).toHaveBeenCalledWith({
      path: fixturePath('explicit-env-override'),
      json: true,
      env: '.env.prod',
    });
  });

  it('scans release-readiness fixture with all issue types and grouped locations', async () => {
    const chunks: string[] = [];
    const stdout = {
      write(chunk: string) {
        chunks.push(chunk);
      },
    } as NodeJS.WritableStream;

    const handler = createHandler(stdout);
    const projectPath = fixturePath('release-readiness');

    const exitCode = await handler.execute({
      path: projectPath,
      json: true,
    });

    const parsed = JSON.parse(chunks.join(''));
    const scanResult = parsed.results[0];

    expect(exitCode).toBe(1);
    expect(parsed.summary.issueCount).toBe(6);
    expect(scanResult.issues.map((issue: { code: string }) => issue.code).sort()).toEqual([
      'ENV_DUPLICATE',
      'ENV_EMPTY',
      'ENV_MISSING',
      'ENV_OPTIONAL',
      'ENV_UNCONFIGURED',
      'ENV_UNUSED',
    ]);

    const missingIssue = scanResult.issues.find(
      (issue: { code: string; variable: string }) =>
        issue.code === 'ENV_MISSING' && issue.variable === 'MISSING_VAR',
    );
    expect(missingIssue.locations).toHaveLength(2);
    expect(missingIssue.locations.map((location: { sourceFile: string }) => location.sourceFile)).toEqual(
      expect.arrayContaining([
        resolve(projectPath, 'src/app.ts'),
        resolve(projectPath, 'src/consumer.ts'),
      ]),
    );
  });
});
