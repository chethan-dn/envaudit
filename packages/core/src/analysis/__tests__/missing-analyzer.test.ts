import { describe, expect, it } from 'vitest';
import { MissingAnalyzer } from '../analyzers/missing-analyzer.js';
import type { VariableDefinition, VariableUsage } from '@envdoctor/contracts';
import { createAnalysisInput } from './test-helpers.js';

describe('MissingAnalyzer', () => {
  const analyzer = new MissingAnalyzer();
  const projectRootPath = '/repo/app';

  it('detects usages without matching definitions', () => {
    const usages: VariableUsage[] = [
      {
        name: 'JWT_SECRET',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 2,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, [], usages))).toEqual([
      {
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'JWT_SECRET',
        projectRootPath,
        sourceFile: '/repo/app/src/app.ts',
        line: 2,
        message: 'JWT_SECRET is used but not defined in environment files',
      },
    ]);
  });

  it('does not flag usages that have definitions', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'JWT_SECRET',
        value: 'secret',
        sourceFile: '/repo/app/.env',
        projectRootPath,
        line: 1,
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'JWT_SECRET',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 2,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, usages))).toEqual([]);
  });

  it('treats empty definitions as defined', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'JWT_SECRET',
        value: '',
        sourceFile: '/repo/app/.env',
        projectRootPath,
        line: 1,
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'JWT_SECRET',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 2,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, usages))).toEqual([]);
  });

  it('emits one issue per missing usage occurrence', () => {
    const usages: VariableUsage[] = [
      {
        name: 'JWT_SECRET',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 2,
        confidence: 'high',
        usageType: 'env',
      },
      {
        name: 'JWT_SECRET',
        sourceFile: '/repo/app/src/config.ts',
        projectRootPath,
        line: 5,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, [], usages))).toHaveLength(2);
  });
});
