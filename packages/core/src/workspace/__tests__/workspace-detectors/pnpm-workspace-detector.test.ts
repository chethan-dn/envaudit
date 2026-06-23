import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileSystemReader } from '../../filesystem/node-file-system-reader.js';
import { PnpmWorkspaceDetector } from '../../workspace-detectors/pnpm-workspace-detector.js';

describe('PnpmWorkspaceDetector', () => {
  let tempDir: string;
  const fs = new NodeFileSystemReader();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envdoctor-pnpm-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('detects pnpm-workspace.yaml', async () => {
    await writeFile(join(tempDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');

    const detector = new PnpmWorkspaceDetector(fs);
    expect(await detector.detect(tempDir)).toBe(true);
  });

  it('discovers workspace packages', async () => {
    await writeFile(join(tempDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
    await mkdir(join(tempDir, 'packages', 'app'), { recursive: true });
    await mkdir(join(tempDir, 'packages', 'lib'), { recursive: true });
    await writeFile(
      join(tempDir, 'packages', 'app', 'package.json'),
      JSON.stringify({ name: '@acme/app' }),
    );
    await writeFile(
      join(tempDir, 'packages', 'lib', 'package.json'),
      JSON.stringify({ name: '@acme/lib' }),
    );

    const detector = new PnpmWorkspaceDetector(fs);
    const projects = await detector.discover(tempDir);

    expect(projects).toEqual([
      {
        name: '@acme/app',
        rootPath: resolve(tempDir, 'packages/app'),
      },
      {
        name: '@acme/lib',
        rootPath: resolve(tempDir, 'packages/lib'),
      },
    ]);
  });
});
