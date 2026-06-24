import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { ConfigServiceUsageExtractor } from '../config-service-usage-extractor.js';

describe('ConfigServiceUsageExtractor', () => {
  const extractor = new ConfigServiceUsageExtractor();
  const projectRootPath = '/repo/app';

  function extract(content: string, filePath = '/repo/app/src/service.ts') {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(filePath, content);
    return extractor.extract(sourceFile, projectRootPath);
  }

  function expectUsage(name: string, line: number, filePath = '/repo/app/src/service.ts') {
    return {
      name,
      sourceFile: filePath,
      projectRootPath,
      line,
      confidence: 'high' as const,
      usageType: 'env' as const,
    };
  }

  it('extracts config.get usages', () => {
    expect(extract('const url = config.get("DATABASE_URL");\n')).toEqual([
      expectUsage('DATABASE_URL', 1),
    ]);
  });

  it('extracts config.getOrThrow usages', () => {
    expect(extract('const url = config.getOrThrow("DATABASE_URL");\n')).toEqual([
      expectUsage('DATABASE_URL', 1),
    ]);
  });

  it('extracts configService.get usages', () => {
    expect(extract('const key = configService.get("OPENAI_API_KEY");\n')).toEqual([
      expectUsage('OPENAI_API_KEY', 1),
    ]);
  });

  it('extracts configService.getOrThrow usages', () => {
    expect(extract('const key = configService.getOrThrow("OPENAI_API_KEY");\n')).toEqual([
      expectUsage('OPENAI_API_KEY', 1),
    ]);
  });

  it('extracts this.config.get usages', () => {
    expect(extract('const id = this.config.get("KEYCLOAK_CLIENT_ID");\n')).toEqual([
      expectUsage('KEYCLOAK_CLIENT_ID', 1),
    ]);
  });

  it('extracts this.configService.getOrThrow usages', () => {
    expect(extract('const secret = this.configService.getOrThrow("KEYCLOAK_CLIENT_SECRET");\n')).toEqual([
      expectUsage('KEYCLOAK_CLIENT_SECRET', 1),
    ]);
  });

  it('ignores dynamic config.get usages', () => {
    expect(extract('const name = "DATABASE_URL"; const value = config.get(name);\n')).toEqual([]);
    expect(extract('const value = config.get(buildName());\n')).toEqual([]);
  });

  it('ignores config.get and config.getOrThrow without arguments', () => {
    expect(extract('const value = config.get();\n')).toEqual([]);
    expect(extract('const value = config.getOrThrow();\n')).toEqual([]);
  });
});
