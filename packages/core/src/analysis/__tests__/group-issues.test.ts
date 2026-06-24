import { describe, expect, it } from 'vitest';
import type { Issue } from 'envaudit-contracts';
import { groupIssues } from '../utils/group-issues.js';

function createIssue(overrides: Partial<Issue> & Pick<Issue, 'code' | 'variable'>): Issue {
  return {
    type: 'missing',
    projectRootPath: '/repo/app',
    ...overrides,
  };
}

describe('groupIssues', () => {
  it('groups the same variable and issue code from multiple files', () => {
    const issues = groupIssues([
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileA.ts',
        line: 35,
      }),
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileB.ts',
        line: 171,
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.locations).toEqual([
      { sourceFile: '/repo/app/src/fileA.ts', line: 35 },
      { sourceFile: '/repo/app/src/fileB.ts', line: 171 },
    ]);
  });

  it('groups the same variable and issue code from multiple locations in one file', () => {
    const issues = groupIssues([
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileA.ts',
        line: 10,
      }),
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileA.ts',
        line: 35,
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.locations).toEqual([
      { sourceFile: '/repo/app/src/fileA.ts', line: 10 },
      { sourceFile: '/repo/app/src/fileA.ts', line: 35 },
    ]);
  });

  it('keeps different issue codes for the same variable separate', () => {
    const issues = groupIssues([
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileA.ts',
        line: 1,
      }),
      createIssue({
        code: 'ENV_OPTIONAL',
        type: 'optional',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileB.ts',
        line: 2,
        defaultValue: 'fallback',
      }),
    ]);

    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.code).sort()).toEqual(['ENV_MISSING', 'ENV_OPTIONAL']);
  });

  it('deduplicates identical locations', () => {
    const issues = groupIssues([
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileA.ts',
        line: 35,
      }),
      createIssue({
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'API_KEY',
        sourceFile: '/repo/app/src/fileA.ts',
        line: 35,
      }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.locations).toEqual([{ sourceFile: '/repo/app/src/fileA.ts', line: 35 }]);
  });
});
