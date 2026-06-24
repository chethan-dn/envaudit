import { Writable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import type { ScanOrchestrator } from '@envaudit/core';
import { ScanCommandHandler } from '../handlers/scan-command-handler.js';
import type { ScanReporter } from '../reporters/interfaces/scan-reporter.js';
import { cleanRepositoryScanResult, sampleRepositoryScanResult } from './fixtures/repository-scan-result.fixture.js';

function createCaptureStream(): { stream: Writable; chunks: string[] } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });

  return { stream, chunks };
}

describe('ScanCommandHandler', () => {
  it('writes reporter output to stdout and returns 1 when issues exist', async () => {
    const orchestrator: ScanOrchestrator = {
      scan: vi.fn().mockResolvedValue(sampleRepositoryScanResult),
    };
    const reporter: ScanReporter = {
      render: vi.fn().mockReturnValue('rendered output\n'),
    };
    const { stream, chunks } = createCaptureStream();

    const handler = new ScanCommandHandler({
      orchestrator,
      createReporter: () => reporter,
      stdout: stream,
    });

    const exitCode = await handler.execute({
      path: process.cwd(),
      json: false,
    });

    expect(exitCode).toBe(1);
    expect(orchestrator.scan).toHaveBeenCalledWith(process.cwd(), undefined);
    expect(reporter.render).toHaveBeenCalledWith(sampleRepositoryScanResult);
    expect(chunks.join('')).toBe('rendered output\n');
  });

  it('returns 0 when no issues are found', async () => {
    const orchestrator: ScanOrchestrator = {
      scan: vi.fn().mockResolvedValue(cleanRepositoryScanResult),
    };
    const reporter: ScanReporter = {
      render: vi.fn().mockReturnValue('clean output\n'),
    };
    const { stream } = createCaptureStream();

    const handler = new ScanCommandHandler({
      orchestrator,
      createReporter: () => reporter,
      stdout: stream,
    });

    const exitCode = await handler.execute({
      path: process.cwd(),
      json: false,
    });

    expect(exitCode).toBe(0);
  });

  it('selects reporter based on json option', async () => {
    const orchestrator: ScanOrchestrator = {
      scan: vi.fn().mockResolvedValue(cleanRepositoryScanResult),
    };
    const humanReporter: ScanReporter = { render: vi.fn().mockReturnValue('human\n') };
    const jsonReporter: ScanReporter = { render: vi.fn().mockReturnValue('json\n') };
    const createReporter = vi.fn((options: { json: boolean }) =>
      options.json ? jsonReporter : humanReporter,
    );
    const { stream } = createCaptureStream();

    const handler = new ScanCommandHandler({
      orchestrator,
      createReporter,
      stdout: stream,
    });

    await handler.execute({ path: process.cwd(), json: true });

    expect(createReporter).toHaveBeenCalledWith({ json: true });
    expect(jsonReporter.render).toHaveBeenCalled();
  });

  it('throws when repository path does not exist', async () => {
    const orchestrator: ScanOrchestrator = {
      scan: vi.fn(),
    };

    const handler = new ScanCommandHandler({
      orchestrator,
      createReporter: () => ({ render: vi.fn() }),
    });

    await expect(
      handler.execute({
        path: '/definitely-missing-envaudit-path',
        json: false,
      }),
    ).rejects.toThrow('Path not found: /definitely-missing-envaudit-path');

    expect(orchestrator.scan).not.toHaveBeenCalled();
  });

  it('propagates orchestrator errors', async () => {
    const orchestrator: ScanOrchestrator = {
      scan: vi.fn().mockRejectedValue(new Error('scan failed')),
    };

    const handler = new ScanCommandHandler({
      orchestrator,
      createReporter: () => ({ render: vi.fn() }),
    });

    await expect(
      handler.execute({
        path: process.cwd(),
        json: false,
      }),
    ).rejects.toThrow('scan failed');
  });
});
