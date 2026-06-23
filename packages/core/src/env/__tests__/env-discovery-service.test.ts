import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DefaultEnvDiscoveryService } from '../env-discovery-service.js';
import { DotenvParser } from '../parser/dotenv-parser.js';
import { ProjectEnvFileDiscoverer } from '../discovery/project-env-file-discoverer.js';
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
      envFileDiscoverer: new ProjectEnvFileDiscoverer(fs),
      envFileParser: new DotenvParser(),
    });

    const definitions = await service.discoverForProject({
      name: 'app',
      rootPath: projectRoot,
    });

    expect(definitions).toEqual([
      {
        name: 'PORT',
        value: '3000',
        sourceFile: resolve(projectRoot, '.env'),
        projectRootPath: projectRoot,
        line: 1,
      },
    ]);
  });
});
