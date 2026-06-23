import { describe, expect, it } from 'vitest';
import { DefaultIssueAnalysisService } from '../issue-analysis-service.js';
import { DuplicateAnalyzer } from '../analyzers/duplicate-analyzer.js';
import { EmptyAnalyzer } from '../analyzers/empty-analyzer.js';
import type { VariableDefinition } from '@envdoctor/contracts';

describe('DefaultIssueAnalysisService', () => {
  const service = new DefaultIssueAnalysisService({
    analyzers: [new DuplicateAnalyzer(), new EmptyAnalyzer()],
  });

  it('isolates duplicate detection by project', () => {
    const definitions: VariableDefinition[] = [
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
      {
        name: 'PORT',
        value: '5173',
        sourceFile: '/repo/web/.env.local',
        projectRootPath: '/repo/web',
        line: 1,
      },
    ];

    const issues = service.analyze(definitions);

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
    ]);
  });

  it('returns both duplicate and empty issues', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        line: 1,
      },
      {
        name: 'PORT',
        value: '',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        line: 2,
      },
    ];

    const issues = service.analyze(definitions);

    expect(issues).toHaveLength(3);
    expect(issues.filter((issue) => issue.type === 'empty')).toHaveLength(2);
    expect(issues.filter((issue) => issue.type === 'duplicate')).toHaveLength(1);
  });
});
