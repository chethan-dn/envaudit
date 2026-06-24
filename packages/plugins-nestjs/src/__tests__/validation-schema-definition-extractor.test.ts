import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { ValidationSchemaDefinitionExtractor } from '../validation-schema-definition-extractor.js';

describe('ValidationSchemaDefinitionExtractor', () => {
  const extractor = new ValidationSchemaDefinitionExtractor();
  const projectRootPath = '/repo/app';

  function extract(content: string, filePath = '/repo/app/src/env.validation.ts') {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(filePath, content);
    return extractor.extract(sourceFile, projectRootPath);
  }

  function expectDefinition(
    name: string,
    options: {
      line: number;
      schemaOptional?: boolean;
      value?: string;
      filePath?: string;
    },
  ) {
    return {
      name,
      sourceFile: options.filePath ?? '/repo/app/src/env.validation.ts',
      projectRootPath,
      line: options.line,
      definitionSource: 'validation-schema' as const,
      schemaOptional: options.schemaOptional ?? false,
      ...(options.value !== undefined ? { value: options.value } : {}),
    };
  }

  it('extracts required schema properties', () => {
    expect(extract('export class EnvironmentVariables {\n  DATABASE_URL: string;\n}\n')).toEqual([
      expectDefinition('DATABASE_URL', { line: 2 }),
    ]);
  });

  it('extracts optional schema properties', () => {
    expect(extract('export class EnvironmentVariables {\n  OPENAI_API_KEY?: string;\n}\n')).toEqual([
      expectDefinition('OPENAI_API_KEY', { line: 2, schemaOptional: true }),
    ]);
  });

  it('extracts default values from schema properties', () => {
    expect(
      extract('export class EnvironmentVariables {\n  THROTTLE_LIMIT: number = 100;\n}\n'),
    ).toEqual([expectDefinition('THROTTLE_LIMIT', { line: 2, value: '100' })]);
  });

  it('ignores lowercase properties', () => {
    expect(
      extract('export class EnvironmentVariables {\n  databaseUrl: string;\n  DATABASE_URL: string;\n}\n'),
    ).toEqual([expectDefinition('DATABASE_URL', { line: 3 })]);
  });

  it('ignores non-env-style properties', () => {
    expect(
      extract('export class EnvironmentVariables {\n  Port: number;\n  enabled: boolean;\n}\n'),
    ).toEqual([]);
  });
});
