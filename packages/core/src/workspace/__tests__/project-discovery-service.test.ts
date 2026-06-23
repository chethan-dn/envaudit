import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileSystemReader } from '../filesystem/node-file-system-reader.js';
import { createProjectDiscoveryService } from '../create-project-discovery-service.js';
import { DefaultProjectDiscoveryService } from '../project-discovery-service.js';
import { createDefaultProjectMarkerDetectors } from '../project-markers/index.js';
import { createDefaultWorkspaceDetectors } from '../workspace-detectors/index.js';

describe('DefaultProjectDiscoveryService', () => {
  let tempDir: string;
  const fs = new NodeFileSystemReader();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envdoctor-discovery-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function createService() {
    return new DefaultProjectDiscoveryService({
      fileSystem: fs,
      workspaceDetectors: createDefaultWorkspaceDetectors(fs),
      projectDetectors: createDefaultProjectMarkerDetectors(fs),
    });
  }

  it('discovers a pnpm monorepo with languages', async () => {
    await writeFile(join(tempDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
    await mkdir(join(tempDir, 'packages', 'cli'), { recursive: true });
    await mkdir(join(tempDir, 'packages', 'web'), { recursive: true });
    await writeFile(
      join(tempDir, 'packages', 'cli', 'package.json'),
      JSON.stringify({ name: '@acme/cli' }),
    );
    await writeFile(join(tempDir, 'packages', 'cli', 'tsconfig.json'), '{}');
    await writeFile(
      join(tempDir, 'packages', 'web', 'package.json'),
      JSON.stringify({ name: '@acme/web' }),
    );

    const result = await createService().discover(tempDir);

    expect(result.rootPath).toBe(resolve(tempDir));
    expect(result.projects).toEqual([
      {
        name: '@acme/cli',
        rootPath: resolve(tempDir, 'packages/cli'),
        type: 'node',
        language: 'typescript',
      },
      {
        name: '@acme/web',
        rootPath: resolve(tempDir, 'packages/web'),
        type: 'node',
        language: 'javascript',
      },
    ]);
  });

  it('prefers pnpm over package.json workspaces', async () => {
    await writeFile(join(tempDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/pnpm-app\n');
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({ workspaces: ['packages/npm-app'] }),
    );
    await mkdir(join(tempDir, 'packages', 'pnpm-app'), { recursive: true });
    await mkdir(join(tempDir, 'packages', 'npm-app'), { recursive: true });
    await writeFile(
      join(tempDir, 'packages', 'pnpm-app', 'package.json'),
      JSON.stringify({ name: 'pnpm-app' }),
    );
    await writeFile(
      join(tempDir, 'packages', 'npm-app', 'package.json'),
      JSON.stringify({ name: 'npm-app' }),
    );

    const result = await createService().discover(tempDir);

    expect(result.projects.map((project) => project.name)).toEqual(['pnpm-app']);
  });

  it('discovers a single javascript project at the repository root', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'solo-app' }));

    const result = await createService().discover(tempDir);

    expect(result).toEqual({
      rootPath: resolve(tempDir),
      projects: [
        {
          name: 'solo-app',
          rootPath: resolve(tempDir),
          type: 'node',
          language: 'javascript',
        },
      ],
    });
  });

  it('discovers a python project from pyproject.toml', async () => {
    await writeFile(join(tempDir, 'pyproject.toml'), '[project]\nname = "acme"\n');

    const result = await createService().discover(tempDir);

    expect(result.projects).toEqual([
      {
        name: 'acme',
        rootPath: resolve(tempDir),
        type: 'python',
        language: 'python',
      },
    ]);
  });

  it('falls back to the current directory when no markers exist', async () => {
    const result = await createService().discover(tempDir);

    expect(result).toEqual({
      rootPath: resolve(tempDir),
      projects: [
        {
          name: basename(tempDir),
          rootPath: resolve(tempDir),
        },
      ],
    });
  });

  it('deduplicates workspace projects by rootPath', async () => {
    await writeFile(join(tempDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/app\n');
    await mkdir(join(tempDir, 'packages', 'app'), { recursive: true });
    await writeFile(
      join(tempDir, 'packages', 'app', 'package.json'),
      JSON.stringify({ name: '@acme/app' }),
    );

    const result = await createService().discover(tempDir);

    expect(result.projects).toHaveLength(1);
  });

  it('works through the factory helper', async () => {
    await writeFile(join(tempDir, 'go.mod'), 'module example.com/app\n');

    const result = await createProjectDiscoveryService().discover(tempDir);

    expect(result.projects[0]).toMatchObject({
      type: 'go',
      language: 'go',
    });
  });
});
