import { describe, expect, it } from 'vitest';
import { MissingAnalyzer } from '../analyzers/missing-analyzer.js';
import type { VariableDefinition, VariableUsage } from 'envanalyser-contracts';
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

  it('does not treat documentation definitions as satisfying missing usages', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'DATABASE_URL',
        value: 'replace-me',
        sourceFile: '/repo/app/.env.example',
        projectRootPath,
        line: 1,
        sourceKind: 'documentation',
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'DATABASE_URL',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 1,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, usages))).toEqual([
      {
        code: 'ENV_MISSING',
        type: 'missing',
        variable: 'DATABASE_URL',
        projectRootPath,
        sourceFile: '/repo/app/src/app.ts',
        line: 1,
        message: 'DATABASE_URL is used but not defined in environment files',
      },
    ]);
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

  it('reports ENV_OPTIONAL for optional usages without matching definitions', () => {
    const usages: VariableUsage[] = [
      {
        name: 'THROTTLE_TTL',
        sourceFile: '/repo/app/src/config.ts',
        projectRootPath,
        line: 70,
        confidence: 'high',
        usageType: 'env',
        optional: true,
        defaultValue: '60',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, [], usages))).toEqual([
      {
        code: 'ENV_OPTIONAL',
        type: 'optional',
        variable: 'THROTTLE_TTL',
        projectRootPath,
        sourceFile: '/repo/app/src/config.ts',
        line: 70,
        defaultValue: '60',
        message:
          'THROTTLE_TTL is used but not defined in environment files. A default value of 60 is provided in code.',
      },
    ]);
  });

  it('reports ENV_OPTIONAL without defaultValue when fallback is non-literal', () => {
    const usages: VariableUsage[] = [
      {
        name: 'FOO',
        sourceFile: '/repo/app/src/config.ts',
        projectRootPath,
        line: 10,
        confidence: 'high',
        usageType: 'env',
        optional: true,
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, [], usages))).toEqual([
      {
        code: 'ENV_OPTIONAL',
        type: 'optional',
        variable: 'FOO',
        projectRootPath,
        sourceFile: '/repo/app/src/config.ts',
        line: 10,
        message: 'FOO is used but not defined in environment files. A fallback value is provided in code.',
      },
    ]);
  });

  it('does not report ENV_OPTIONAL when optional usage has a runtime definition', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'THROTTLE_TTL',
        value: '120',
        sourceFile: '/repo/app/.env',
        projectRootPath,
        line: 1,
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'THROTTLE_TTL',
        sourceFile: '/repo/app/src/config.ts',
        projectRootPath,
        line: 70,
        confidence: 'high',
        usageType: 'env',
        optional: true,
        defaultValue: '60',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, usages))).toEqual([]);
  });

  it('reports ENV_UNCONFIGURED when usage matches validation schema but not runtime env', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'DATABASE_URL',
        sourceFile: '/repo/app/src/env.validation.ts',
        projectRootPath,
        line: 2,
        definitionSource: 'validation-schema',
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'DATABASE_URL',
        sourceFile: '/repo/app/src/service.ts',
        projectRootPath,
        line: 4,
        confidence: 'high',
        usageType: 'env',
      },
    ];

    expect(
      analyzer.analyze({
        ...createAnalysisInput(projectRootPath, definitions, usages),
        runtimeEnvFiles: ['/repo/app/.env'],
      }),
    ).toEqual([
      {
        code: 'ENV_UNCONFIGURED',
        type: 'unconfigured',
        variable: 'DATABASE_URL',
        projectRootPath,
        sourceFile: '/repo/app/src/env.validation.ts',
        line: 2,
        schemaFile: '/repo/app/src/env.validation.ts',
        runtimeEnvFiles: ['/repo/app/.env'],
        message:
          'DATABASE_URL is declared in the application configuration schema but is not configured in runtime environment files.',
      },
    ]);
  });

  it('prefers ENV_OPTIONAL over ENV_UNCONFIGURED when code provides a fallback', () => {
    const definitions: VariableDefinition[] = [
      {
        name: 'THROTTLE_LIMIT',
        sourceFile: '/repo/app/src/env.validation.ts',
        projectRootPath,
        line: 3,
        definitionSource: 'validation-schema',
        value: '100',
      },
    ];
    const usages: VariableUsage[] = [
      {
        name: 'THROTTLE_LIMIT',
        sourceFile: '/repo/app/src/service.ts',
        projectRootPath,
        line: 5,
        confidence: 'high',
        usageType: 'env',
        optional: true,
        defaultValue: '100',
      },
    ];

    expect(analyzer.analyze(createAnalysisInput(projectRootPath, definitions, usages))).toEqual([
      expect.objectContaining({
        code: 'ENV_OPTIONAL',
        variable: 'THROTTLE_LIMIT',
      }),
    ]);
  });
});
