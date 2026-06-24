import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileSystemReader } from '../../filesystem/node-file-system-reader.js';
import { TurboWorkspaceDetector } from '../../workspace-detectors/turbo-workspace-detector.js';

describe('TurboWorkspaceDetector', () => {
  let tempDir: string;
  const fs = new NodeFileSystemReader();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envanalyser-turbo-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('detects turbo.json', async () => {
    await writeFile(join(tempDir, 'turbo.json'), '{}');
    const detector = new TurboWorkspaceDetector(fs);

    expect(await detector.detect(tempDir)).toBe(true);
  });

  it('discovers packages via package.json workspaces', async () => {
    await writeFile(join(tempDir, 'turbo.json'), '{}');
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({
        workspaces: ['packages/*'],
      }),
    );
    await mkdir(join(tempDir, 'packages', 'ui'), { recursive: true });
    await writeFile(join(tempDir, 'packages', 'ui', 'package.json'), JSON.stringify({ name: 'ui' }));

    const detector = new TurboWorkspaceDetector(fs);
    const projects = await detector.discover(tempDir);

    expect(projects).toEqual([
      {
        name: 'ui',
        rootPath: resolve(tempDir, 'packages/ui'),
      },
    ]);
  });

  it('returns empty when turbo exists without workspaces', async () => {
    await writeFile(join(tempDir, 'turbo.json'), '{}');
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'root' }));

    const detector = new TurboWorkspaceDetector(fs);
    await expect(detector.discover(tempDir)).resolves.toEqual([]);
  });
});
