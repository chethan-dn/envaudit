import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DefaultEnvDiscoveryService } from '../env-discovery-service.js';
import { DotenvParser } from '../parser/dotenv-parser.js';
import { InMemoryFileSystemReader } from '../../workspace/__tests__/in-memory-file-system.js';

describe('DefaultEnvDiscoveryService', () => {
  it('skips unreadable env files', async () => {
    const projectRoot = '/repo/app';
    const fs = new InMemoryFileSystemReader({
      [`${projectRoot}/.env`]: 'PORT=3000\n',
    });
    fs.addFile(`${projectRoot}/.env.local`, 'DEBUG=true\n');

    const unreadablePath = resolve(projectRoot, '.env.local');
    const originalReadFile = fs.readFile.bind(fs);
    vi.spyOn(fs, 'readFile').mockImplementation(async (filePath: string) => {
      if (filePath === unreadablePath) {
        throw new Error('unreadable');
      }

      return originalReadFile(filePath);
    });

    const service = new DefaultEnvDiscoveryService({
      fileSystem: fs,
      envFileParser: new DotenvParser(),
    });

    const result = await service.discoverForProject({
      name: 'app',
      rootPath: projectRoot,
    });

    expect(result.definitions).toEqual([
      {
        name: 'PORT',
        value: '3000',
        sourceFile: resolve(projectRoot, '.env'),
        projectRootPath: projectRoot,
        line: 1,
        sourceKind: 'runtime',
      },
    ]);
    expect(result.environmentFiles).toEqual({
      runtime: [resolve(projectRoot, '.env'), resolve(projectRoot, '.env.local')],
      documentation: [],
    });
  });

  it('discovers workspace root runtime env files for nested projects', async () => {
    const workspaceRoot = '/repo';
    const projectRoot = '/repo/apps/service';
    const fs = new InMemoryFileSystemReader({
      [`${workspaceRoot}/.env`]: 'DATABASE_URL=postgres://localhost/db\n',
      [`${workspaceRoot}/.env.dev`]: 'DEBUG=true\n',
      [`${projectRoot}/.env.example`]: 'DATABASE_URL=\n',
    });

    const service = new DefaultEnvDiscoveryService({
      fileSystem: fs,
      envFileParser: new DotenvParser(),
    });

    const result = await service.discoverForProject(
      { name: 'service', rootPath: projectRoot },
      { workspaceRootPath: workspaceRoot },
    );

    expect(result.environmentFiles).toEqual({
      runtime: [resolve(workspaceRoot, '.env'), resolve(workspaceRoot, '.env.dev')],
      documentation: [resolve(projectRoot, '.env.example')],
    });
    expect(result.definitions).toContainEqual({
      name: 'DATABASE_URL',
      value: 'postgres://localhost/db',
      sourceFile: resolve(workspaceRoot, '.env'),
      projectRootPath: projectRoot,
      line: 1,
      sourceKind: 'runtime',
    });
  });

  it('uses only the override runtime env file when runtimeEnvOverridePath is set', async () => {
    const projectRoot = '/repo/app';
    const fs = new InMemoryFileSystemReader({
      [`${projectRoot}/.env`]: 'PORT=3000\n',
      [`${projectRoot}/.env.prod`]: 'PORT=4000\n',
      [`${projectRoot}/.env.example`]: 'PORT=\n',
    });

    const service = new DefaultEnvDiscoveryService({
      fileSystem: fs,
      envFileParser: new DotenvParser(),
    });

    const result = await service.discoverForProject(
      { name: 'app', rootPath: projectRoot },
      { runtimeEnvOverridePath: resolve(projectRoot, '.env.prod') },
    );

    expect(result.environmentFiles).toEqual({
      runtime: [resolve(projectRoot, '.env.prod')],
      documentation: [resolve(projectRoot, '.env.example')],
    });
    expect(result.definitions).toEqual(
      expect.arrayContaining([
        {
          name: 'PORT',
          value: '4000',
          sourceFile: resolve(projectRoot, '.env.prod'),
          projectRootPath: projectRoot,
          line: 1,
          sourceKind: 'runtime',
        },
        {
          name: 'PORT',
          value: '',
          sourceFile: resolve(projectRoot, '.env.example'),
          projectRootPath: projectRoot,
          line: 1,
          sourceKind: 'documentation',
        },
      ]),
    );
    expect(result.definitions).toHaveLength(2);
  });
});
