import { describe, expect, it } from 'vitest';
import { UnusedAnalyzer } from '../analyzers/unused-analyzer.js';
import type { VariableDefinition, VariableUsage } from '@envdoctor/contracts';
import { createAnalysisInput } from './test-helpers.js';

describe('UnusedAnalyzer', () => {
  const analyzer = new UnusedAnalyzer();
  const projectRootPath = '/repo/app';

  it('detects definitions without matching usages', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/app/.env',
        projectRootPath,
        line: 1,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, []))).toEqual([
      {
        code: 'ENV_UNUSED',
        type: 'unused',
        variable: 'PORT',
        projectRootPath,
        sourceFile: '/repo/app/.env',
        line: 1,
        message: 'PORT is defined but never used',
      },
    ]);
  });

  it('does not flag definitions that have usages', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'PORT',
        value: '3000',
        sourceFile: '/repo/app/.env',
        projectRootPath,
        line: 1,
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'PORT',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 1,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, usages))).toEqual([]);
  });

  it('emits one issue per unused definition occurrence', () => {
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

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, []))).toEqual([
      {
        code: 'ENV_UNUSED',
        type: 'unused',
        variable: 'PORT',
        projectRootPath,
        sourceFile: '/repo/app/.env',
        line: 1,
        message: 'PORT is defined but never used',
      },
      {
        code: 'ENV_UNUSED',
        type: 'unused',
        variable: 'PORT',
        projectRootPath,
        sourceFile: '/repo/app/.env.local',
        line: 1,
        message: 'PORT is defined but never used',
      },
    ]);
  });
});
