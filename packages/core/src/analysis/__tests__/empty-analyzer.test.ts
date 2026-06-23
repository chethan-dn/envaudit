import { describe, expect, it } from 'vitest';
import { EmptyAnalyzer } from '../analyzers/empty-analyzer.js';
import type { VariableDefinition } from '@envdoctor/contracts';

describe('EmptyAnalyzer', () => {
  const analyzer = new EmptyAnalyzer();

  it('detects variables with empty string values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'SECRET_KEY',
        value: '',
        sourceFile: '/repo/.env.template',
        projectRootPath: '/repo',
        line: 4,
      },
    ];

    expect(analyzer.analyze(definitions)).toEqual([
      {
        code: 'ENV_EMPTY',
        type: 'empty',
        variable: 'SECRET_KEY',
        projectRootPath: '/repo',
        sourceFile: '/repo/.env.template',
        line: 4,
        message: 'SECRET_KEY has an empty value',
      },
    ]);
  });

  it('ignores variables with non-empty values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        line: 1,
      },
    ];

    expect(analyzer.analyze(definitions)).toEqual([]);
  });

  it('ignores variables with undefined values', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        line: 1,
      },
    ];

    expect(analyzer.analyze(definitions)).toEqual([]);
  });
});
