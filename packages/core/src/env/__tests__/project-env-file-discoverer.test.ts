import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ProjectDirectoryNotFoundError,
  ProjectEnvFileDiscoverer,
} from '../discovery/project-env-file-discoverer.js';
import { InMemoryFileSystemReader } from '../../workspace/__tests__/in-memory-file-system.js';

describe('ProjectEnvFileDiscoverer', () => {
  it('discovers env files at the project root', async () => {
    const projectRoot = '/repo/app';
    const fs = new InMemoryFileSystemReader({
      [`${projectRoot}/.env`]: 'PORT=3000\n',
      [`${projectRoot}/.env.local`]: 'DEBUG=true\n',
      [`${projectRoot}/package.json`]: '{}',
    });
    const discoverer = new ProjectEnvFileDiscoverer(fs);

    await expect(
      discoverer.discover({ name: 'app', rootPath: projectRoot }),
    ).resolves.toEqual([resolve(projectRoot, '.env'), resolve(projectRoot, '.env.local')]);
  });

  it('throws when the project directory is missing', async () => {
    const discoverer = new ProjectEnvFileDiscoverer(new InMemoryFileSystemReader());

    await expect(
      discoverer.discover({ name: 'missing', rootPath: '/missing/project' }),
    ).rejects.toBeInstanceOf(ProjectDirectoryNotFoundError);
  });
});
