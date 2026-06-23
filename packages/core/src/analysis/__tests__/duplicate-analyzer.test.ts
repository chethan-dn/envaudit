import { describe, expect, it } from 'vitest';
import { DuplicateAnalyzer } from '../analyzers/duplicate-analyzer.js';
import type { VariableDefinition } from '@envdoctor/contracts';
import { createAnalysisInput } from './test-helpers.js';

describe('DuplicateAnalyzer', () => {
  const analyzer = new DuplicateAnalyzer();
  const projectRootPath = '/repo/app';
  const sourceFile = '/repo/app/.env';

  it('detects duplicate variables within the same file', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile,
        projectRootPath,
        line: 1,
      },
      {
        name: 'PORT',
        value: '3001',
        sourceFile,
        projectRootPath,
        line: 3,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toEqual([
      {
        code: 'ENV_DUPLICATE',
        type: 'duplicate',
        variable: 'PORT',
        projectRootPath,
        sourceFile,
        line: 3,
        message: 'PORT is also defined in /repo/app/.env:1',
      },
    ]);
  });

  it('does not detect duplicates across different env files', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/app/.env',
        projectRootPath,
        line: 1,
      },
      {
        name: 'PORT',
        value: '3001',
        sourceFile: '/repo/app/.env.local',
        projectRootPath,
        line: 1,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toEqual([]);
  });

  it('scopes analysis to the project root path', () => {
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
        value: '5173',
        sourceFile: '/repo/web/.env.local',
        projectRootPath: '/repo/web',
        line: 1,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput('/repo/api', definitions))).toEqual([]);
  });

  it('emits one issue per extra duplicate line in the same file', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '1',
        sourceFile,
        projectRootPath,
        line: 1,
      },
      {
        name: 'PORT',
        value: '2',
        sourceFile,
        projectRootPath,
        line: 2,
      },
      {
        name: 'PORT',
        value: '3',
        sourceFile,
        projectRootPath,
        line: 3,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toHaveLength(2);
  });
});
