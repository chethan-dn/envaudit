import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileSystemReader } from '../../filesystem/node-file-system-reader.js';
import { NxWorkspaceDetector } from '../../workspace-detectors/nx-workspace-detector.js';

describe('NxWorkspaceDetector', () => {
  let tempDir: string;
  const fs = new NodeFileSystemReader();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envaudit-nx-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('discovers projects from nx.json projects map', async () => {
    await writeFile(
      join(tempDir, 'nx.json'),
      JSON.stringify({
        projects: {
          cli: 'packages/cli',
          core: 'packages/core',
        },
      }),
    );
    await mkdir(join(tempDir, 'packages', 'cli'), { recursive: true });
    await mkdir(join(tempDir, 'packages', 'core'), { recursive: true });

    const detector = new NxWorkspaceDetector(fs);
    const projects = await detector.discover(tempDir);

    expect(projects).toEqual([
      { name: 'cli', rootPath: resolve(tempDir, 'packages/cli') },
      { name: 'core', rootPath: resolve(tempDir, 'packages/core') },
    ]);
  });

  it('discovers projects from project.json files', async () => {
    await writeFile(join(tempDir, 'nx.json'), '{}');
    await mkdir(join(tempDir, 'apps', 'api'), { recursive: true });
    await writeFile(join(tempDir, 'apps', 'api', 'project.json'), '{}');

    const detector = new NxWorkspaceDetector(fs);
    const projects = await detector.discover(tempDir);

    expect(projects).toEqual([
      { name: 'api', rootPath: resolve(tempDir, 'apps/api') },
    ]);
  });
});
