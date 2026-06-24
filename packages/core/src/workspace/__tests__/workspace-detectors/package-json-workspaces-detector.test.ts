import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileSystemReader } from '../../filesystem/node-file-system-reader.js';
import { PackageJsonWorkspacesDetector } from '../../workspace-detectors/package-json-workspaces-detector.js';

describe('PackageJsonWorkspacesDetector', () => {
  let tempDir: string;
  const fs = new NodeFileSystemReader();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envaudit-npm-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('discovers npm workspace packages', async () => {
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({
        name: 'root',
        workspaces: ['packages/*'],
      }),
    );
    await mkdir(join(tempDir, 'packages', 'app'), { recursive: true });
    await writeFile(
      join(tempDir, 'packages', 'app', 'package.json'),
      JSON.stringify({ name: '@acme/app' }),
    );

    const detector = new PackageJsonWorkspacesDetector(fs);
    expect(await detector.detect(tempDir)).toBe(true);

    const projects = await detector.discover(tempDir);
    expect(projects).toEqual([
      {
        name: '@acme/app',
        rootPath: resolve(tempDir, 'packages/app'),
      },
    ]);
  });

  it('supports workspaces.packages object shape', async () => {
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({
        workspaces: {
          packages: ['apps/*'],
        },
      }),
    );
    await mkdir(join(tempDir, 'apps', 'web'), { recursive: true });
    await writeFile(join(tempDir, 'apps', 'web', 'package.json'), JSON.stringify({ name: 'web' }));

    const detector = new PackageJsonWorkspacesDetector(fs);
    const projects = await detector.discover(tempDir);

    expect(projects).toEqual([
      {
        name: 'web',
        rootPath: resolve(tempDir, 'apps/web'),
      },
    ]);
  });
});
