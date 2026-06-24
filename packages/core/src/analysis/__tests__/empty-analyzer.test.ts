import { describe, expect, it } from 'vitest';
import { EmptyAnalyzer } from '../analyzers/empty-analyzer.js';
import type { VariableDefinition } from 'envanalyser-contracts';
import { createAnalysisInput } from './test-helpers.js';

describe('EmptyAnalyzer', () => {
  const analyzer = new EmptyAnalyzer();
  const projectRootPath = '/repo';

  it('detects runtime variables with empty string values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'SECRET_KEY',
        value: '',
        sourceFile: '/repo/.env',
        projectRootPath,
        line: 4,
        sourceKind: 'runtime',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toEqual([
      {
        code: 'ENV_EMPTY',
        type: 'empty',
        variable: 'SECRET_KEY',
        projectRootPath,
        sourceFile: '/repo/.env',
        line: 4,
        message: 'SECRET_KEY has an empty value',
      },
    ]);
  });

  it('ignores documentation env definitions with empty values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'SECRET_KEY',
        value: '',
        sourceFile: '/repo/.env.template',
        projectRootPath,
        line: 4,
        sourceKind: 'documentation',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toEqual([]);
  });

  it('ignores variables with non-empty values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/.env',
        projectRootPath,
        line: 1,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toEqual([]);
  });

  it('ignores variables with undefined values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        sourceFile: '/repo/.env',
        projectRootPath,
        line: 1,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions))).toEqual([]);
  });
});
