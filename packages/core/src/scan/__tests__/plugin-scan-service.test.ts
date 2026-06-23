import { describe, expect, it, vi } from 'vitest';
import type { ScannerPlugin } from '@envdoctor/contracts';
import { DefaultPluginScanService } from '../plugin-scan-service.js';

describe('DefaultPluginScanService', () => {
  const service = new DefaultPluginScanService();
  const project = {
    name: 'app',
    rootPath: '/repo/app',
  };

  it('collects usages from matching plugins', async () => {
    const plugin: ScannerPlugin = {
      id: 'test',
      name: 'Test',
      detect: vi.fn().mockResolvedValue(true),
      scan: vi.fn().mockResolvedValue([
        {
          name: 'PORT',
          sourceFile: '/repo/app/src/app.ts',
          projectRootPath: '/repo/app',
          line: 1,
          confidence: 'high',
          usageType: 'env',
        },
      ]),
    };

    const outcome = await service.scanProject(project, [plugin]);

    expect(outcome.usages).toHaveLength(1);
    expect(outcome.failures).toEqual([]);
    expect(outcome.sourceMetrics).toEqual({
      scannedFileCount: 0,
      skippedFileCount: 0,
    });
  });

  it('skips plugins that do not detect the project', async () => {
    const plugin: ScannerPlugin = {
      id: 'test',
      name: 'Test',
      detect: vi.fn().mockResolvedValue(false),
      scan: vi.fn(),
    };

    const outcome = await service.scanProject(project, [plugin]);

    expect(outcome.usages).toEqual([]);
    expect(plugin.scan).not.toHaveBeenCalled();
  });

  it('isolates plugin failures without stopping other plugins', async () => {
    const failingPlugin: ScannerPlugin = {
      id: 'failing',
      name: 'Failing',
      detect: vi.fn().mockResolvedValue(true),
      scan: vi.fn().mockRejectedValue(new Error('scan failed')),
    };
    const workingPlugin: ScannerPlugin = {
      id: 'working',
      name: 'Working',
      detect: vi.fn().mockResolvedValue(true),
      scan: vi.fn().mockResolvedValue([
        {
          name: 'JWT_SECRET',
          sourceFile: '/repo/app/src/app.ts',
          projectRootPath: '/repo/app',
          line: 2,
          confidence: 'high',
          usageType: 'env',
        },
      ]),
    };

    const outcome = await service.scanProject(project, [failingPlugin, workingPlugin]);

    expect(outcome.usages).toHaveLength(1);
    expect(outcome.failures).toEqual([
      {
        pluginId: 'failing',
        projectRootPath: '/repo/app',
        message: 'scan failed',
      },
    ]);
  });
});
