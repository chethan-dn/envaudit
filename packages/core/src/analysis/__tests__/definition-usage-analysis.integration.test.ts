import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createEnvDiscoveryService } from '../../env/create-env-discovery-service.js';
import { createIssueAnalysisService } from '../create-issue-analysis-service.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('definition / usage analysis integration', () => {
  const envDiscovery = createEnvDiscoveryService();
  const issueAnalysis = createIssueAnalysisService();

  it('does not emit ENV_EMPTY for documentation env files in env-heavy fixture', async () => {
    const projectRootPath = fixturePath('env-heavy');
    const { definitions } = await envDiscovery.discoverForProject({
      name: 'env-heavy',
      rootPath: projectRootPath,
    });

    const issues = issueAnalysis.analyze({
      projectRootPath,
      definitions,
      usages: [],
    });

    expect(issues.filter((issue) => issue.code === 'ENV_EMPTY')).toEqual([]);
    expect(definitions.some((definition) => definition.sourceKind === 'documentation')).toBe(true);
  });

  it('detects unused definitions in env-heavy when no usages are provided', async () => {
    const projectRootPath = fixturePath('env-heavy');
    const { definitions } = await envDiscovery.discoverForProject({
      name: 'env-heavy',
      rootPath: projectRootPath,
    });

    const issues = issueAnalysis.analyze({
      projectRootPath,
      definitions,
      usages: [],
    });

    expect(issues.filter((issue) => issue.code === 'ENV_UNUSED').length).toBeGreaterThan(0);
    expect(issues.filter((issue) => issue.code === 'ENV_MISSING')).toEqual([]);
  });

  it('detects missing usages in typescript-usage fixture', async () => {
    const projectRootPath = fixturePath('typescript-usage');
    const usages = [
      {
        name: 'DATABASE_URL',
        sourceFile: resolve(projectRootPath, 'src/app.ts'),
        projectRootPath,
        line: 1,
        confidence: 'high' as const,
        usageType: 'env' as const,
      },
      {
        name: 'JWT_SECRET',
        sourceFile: resolve(projectRootPath, 'src/app.ts'),
        projectRootPath,
        line: 2,
        confidence: 'high' as const,
        usageType: 'env' as const,
      },
      {
        name: 'REDIS_URL',
        sourceFile: resolve(projectRootPath, 'src/cache.ts'),
        projectRootPath,
        line: 1,
        confidence: 'high' as const,
        usageType: 'env' as const,
      },
    ];

    const issues = issueAnalysis.analyze({
      projectRootPath,
      definitions: [],
      usages,
    });

    expect(issues.filter((issue) => issue.code === 'ENV_MISSING')).toEqual([
      {
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'DATABASE_URL',
        projectRootPath,
        sourceFile: resolve(projectRootPath, 'src/app.ts'),
        line: 1,
        message: 'DATABASE_URL is used but not defined in environment files',
      },
      {
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'JWT_SECRET',
        projectRootPath,
        sourceFile: resolve(projectRootPath, 'src/app.ts'),
        line: 2,
        message: 'JWT_SECRET is used but not defined in environment files',
      },
      {
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'REDIS_URL',
        projectRootPath,
        sourceFile: resolve(projectRootPath, 'src/cache.ts'),
        line: 1,
        message: 'REDIS_URL is used but not defined in environment files',
      },
    ]);
  });

  it('does not flag PORT across pnpm-monorepo projects', async () => {
    const apiRoot = fixturePath('pnpm-monorepo/apps/api');
    const webRoot = fixturePath('pnpm-monorepo/apps/web');

    const { definitions: apiDefinitions } = await envDiscovery.discoverForProject({
      name: 'api',
      rootPath: apiRoot,
    });
    const { definitions: webDefinitions } = await envDiscovery.discoverForProject({
      name: 'web',
      rootPath: webRoot,
    });

    const issues = issueAnalysis.analyzeAll([
      {
        projectRootPath: apiRoot,
        definitions: apiDefinitions,
        usages: [],
      },
      {
        projectRootPath: webRoot,
        definitions: webDefinitions,
        usages: [],
      },
    ]);

    expect(issues.filter((issue) => issue.code === 'ENV_DUPLICATE')).toEqual([]);
    expect(issues.filter((issue) => issue.code === 'ENV_MISSING')).toEqual([]);
  });
});
