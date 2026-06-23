import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createEnvDiscoveryService } from '../../env/create-env-discovery-service.js';
import { createIssueAnalysisService } from '../create-issue-analysis-service.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');

function fixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('issue analysis integration', () => {
  const envDiscovery = createEnvDiscoveryService();
  const issueAnalysis = createIssueAnalysisService();

  it('detects empty variables in env-heavy fixture', async () => {
    const projectRootPath = fixturePath('env-heavy');
    const definitions = await envDiscovery.discoverForProject({
      name: 'env-heavy',
      rootPath: projectRootPath,
    });

    const issues = issueAnalysis.analyze(definitions);
    const emptyIssues = issues.filter((issue) => issue.code === 'ENV_EMPTY');

    expect(emptyIssues).toContainEqual({
      code: 'ENV_EMPTY',
      type: 'empty',
      variable: 'SECRET_KEY',
      projectRootPath,
      sourceFile: resolve(projectRootPath, '.env.template'),
      line: 4,
      message: 'SECRET_KEY has an empty value',
    });

    const templateFile = resolve(projectRootPath, '.env.template');
    const templateEmptyIssues = emptyIssues.filter((issue) => issue.sourceFile === templateFile);

    expect(templateEmptyIssues).toHaveLength(4);
    expect(templateEmptyIssues.map((issue) => issue.variable).sort()).toEqual([
      'API_URL',
      'DATABASE_URL',
      'PORT',
      'SECRET_KEY',
    ]);
  });

  it('does not flag cross-file PORT overrides in env-heavy as duplicates', async () => {
    const projectRootPath = fixturePath('env-heavy');
    const definitions = await envDiscovery.discoverForProject({
      name: 'env-heavy',
      rootPath: projectRootPath,
    });

    const issues = issueAnalysis.analyze(definitions);

    expect(issues.filter((issue) => issue.code === 'ENV_DUPLICATE')).toEqual([]);
  });

  it('does not flag PORT across pnpm-monorepo projects as duplicates', async () => {
    const apiRoot = fixturePath('pnpm-monorepo/apps/api');
    const webRoot = fixturePath('pnpm-monorepo/apps/web');

    const definitions = await envDiscovery.discoverForProjects([
      { name: 'api', rootPath: apiRoot },
      { name: 'web', rootPath: webRoot },
    ]);

    const issues = issueAnalysis.analyze(definitions);

    expect(issues.filter((issue) => issue.code === 'ENV_DUPLICATE')).toEqual([]);
  });
});
