import { describe, expect, it } from 'vitest';
import { DefaultIssueAnalysisService } from '../issue-analysis-service.js';
import { DuplicateAnalyzer } from '../analyzers/duplicate-analyzer.js';
import { EmptyAnalyzer } from '../analyzers/empty-analyzer.js';
import { MissingAnalyzer } from '../analyzers/missing-analyzer.js';
import { UnusedAnalyzer } from '../analyzers/unused-analyzer.js';
import type { VariableDefinition, VariableUsage } from 'envanalyser-contracts';
import { createAnalysisInput } from './test-helpers.js';

describe('DefaultIssueAnalysisService', () => {
  const service = new DefaultIssueAnalysisService({
    analyzers: [
      new DuplicateAnalyzer(),
      new EmptyAnalyzer(),
      new MissingAnalyzer(),
      new UnusedAnalyzer(),
    ],
  });

  it('isolates analysis by project root path', () => {
    const apiDefinitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/api/.env',
        projectRootPath: '/repo/api',
        line: 1,
      },
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/api/.env',
        projectRootPath: '/repo/api',
        line: 2,
      },
    ];
    const webDefinitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '5173',
        sourceFile: '/repo/web/.env.local',
        projectRootPath: '/repo/web',
        line: 1,
      },
    ];

    const issues = service.analyzeAll([
      createAnalysisInput('/repo/api', apiDefinitions),
      createAnalysisInput('/repo/web', webDefinitions),
    ]);

    expect(issues).toEqual([
      {
        code: 'ENV_DUPLICATE',
        type: 'duplicate',
        variable: 'PORT',
        projectRootPath: '/repo/api',
        sourceFile: '/repo/api/.env',
        line: 2,
        message: 'PORT is also defined in /repo/api/.env:1',
      },
      {
        code: 'ENV_UNUSED',
        type: 'unused',
        variable: 'PORT',
        projectRootPath: '/repo/api',
        sourceFile: '/repo/api/.env',
        line: 1,
        message: 'PORT is defined but never used',
      },
      {
        code: 'ENV_UNUSED',
        type: 'unused',
        variable: 'PORT',
        projectRootPath: '/repo/api',
        sourceFile: '/repo/api/.env',
        line: 2,
        message: 'PORT is defined but never used',
      },
      {
        code: 'ENV_UNUSED',
        type: 'unused',
        variable: 'PORT',
        projectRootPath: '/repo/web',
        sourceFile: '/repo/web/.env.local',
        line: 1,
        message: 'PORT is defined but never used',
      },
    ]);
  });

  it('returns duplicate, empty, missing, and unused issues together', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        line: 1,
      },
      {
        name: 'PORT',
        value: '3001',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        line: 2,
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'JWT_SECRET',
        sourceFile: '/repo/src/app.ts',
        projectRootPath: '/repo',
        line: 3,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    const issues = service.analyze(createAnalysisInput('/repo', definitions, usages));

    expect(issues.filter((issue) => issue.code === 'ENV_EMPTY')).toHaveLength(0);
    expect(issues.filter((issue) => issue.code === 'ENV_DUPLICATE')).toHaveLength(1);
    expect(issues.filter((issue) => issue.code === 'ENV_MISSING')).toHaveLength(1);
    expect(issues.filter((issue) => issue.code === 'ENV_UNUSED')).toHaveLength(2);
  });
});
