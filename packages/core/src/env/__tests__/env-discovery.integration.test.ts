import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createEnvDiscoveryService } from '../create-env-discovery-service.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('env discovery integration', () => {
  const service = createEnvDiscoveryService();

  it('discovers all env-heavy fixture files', async () => {
    const projectRootPath = fixturePath('env-heavy');
    const definitions = await service.discoverForProject({
      name: 'env-heavy',
      rootPath: projectRootPath,
    });

    const sourceFiles = [...new Set(definitions.map((definition) => definition.sourceFile))].sort();

    expect(sourceFiles).toEqual([
      resolve(projectRootPath, '.env'),
      resolve(projectRootPath, '.env.development'),
      resolve(projectRootPath, '.env.example'),
      resolve(projectRootPath, '.env.local'),
      resolve(projectRootPath, '.env.production'),
      resolve(projectRootPath, '.env.staging'),
      resolve(projectRootPath, '.env.template'),
      resolve(projectRootPath, '.env.test'),
    ]);

    expect(definitions).toContainEqual({
      name: 'PORT',
      value: '3000',
      sourceFile: resolve(projectRootPath, '.env'),
      projectRootPath,
      line: 1,
      sourceKind: 'runtime',
    });

    expect(definitions).toContainEqual({
      name: 'SECRET_KEY',
      value: '',
      sourceFile: resolve(projectRootPath, '.env.template'),
      projectRootPath,
      line: 4,
      sourceKind: 'documentation',
    });
  });

  it('discovers env files per project in pnpm-monorepo fixture', async () => {
    const apiRoot = fixturePath('pnpm-monorepo/apps/api');
    const webRoot = fixturePath('pnpm-monorepo/apps/web');

    const apiDefinitions = await service.discoverForProject({
      name: 'api',
      rootPath: apiRoot,
    });
    const webDefinitions = await service.discoverForProject({
      name: 'web',
      rootPath: webRoot,
    });

    expect(apiDefinitions).toEqual([
      {
        name: 'PORT',
        value: '3000',
        sourceFile: resolve(apiRoot, '.env'),
        projectRootPath: apiRoot,
        line: 1,
        sourceKind: 'runtime',
      },
      {
        name: 'API_URL',
        value: 'http://localhost:3000',
        sourceFile: resolve(apiRoot, '.env'),
        projectRootPath: apiRoot,
        line: 2,
        sourceKind: 'runtime',
      },
      {
        name: 'DATABASE_URL',
        value: 'postgres://localhost:5432/api_dev',
        sourceFile: resolve(apiRoot, '.env'),
        projectRootPath: apiRoot,
        line: 3,
        sourceKind: 'runtime',
      },
    ]);

    expect(webDefinitions).toEqual([
      {
        name: 'PORT',
        value: '5173',
        sourceFile: resolve(webRoot, '.env.local'),
        projectRootPath: webRoot,
        line: 1,
        sourceKind: 'runtime',
      },
      {
        name: 'VITE_API_URL',
        value: 'http://localhost:3000',
        sourceFile: resolve(webRoot, '.env.local'),
        projectRootPath: webRoot,
        line: 2,
        sourceKind: 'runtime',
      },
      {
        name: 'VITE_APP_NAME',
        value: 'web-local',
        sourceFile: resolve(webRoot, '.env.local'),
        projectRootPath: webRoot,
        line: 3,
        sourceKind: 'runtime',
      },
    ]);
  });

  it('returns no definitions for single-js fixture', async () => {
    const projectRootPath = fixturePath('single-js');

    await expect(
      service.discoverForProject({
        name: 'single-js',
        rootPath: projectRootPath,
      }),
    ).resolves.toEqual([]);
  });
});
