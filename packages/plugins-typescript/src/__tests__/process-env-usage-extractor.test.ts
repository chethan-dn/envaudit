import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { ProcessEnvUsageExtractor } from '../scanner/process-env-usage-extractor.js';

describe('ProcessEnvUsageExtractor', () => {
  const extractor = new ProcessEnvUsageExtractor();
  const projectRootPath = '/repo/app';

  function extract(content: string, filePath = '/repo/app/src/app.ts') {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(filePath, content);
    return extractor.extract(sourceFile, projectRootPath);
  }

  function expectUsage(
    name: string,
    filePath: string,
    line: number,
    options: { optional?: boolean; defaultValue?: string } = {},
  ) {
    return {
      name,
      sourceFile: filePath,
      projectRootPath,
      line,
      confidence: 'high' as const,
      usageType: 'env' as const,
      optional: options.optional ?? false,
      ...(options.defaultValue !== undefined ? { defaultValue: options.defaultValue } : {}),
    };
  }

  it('extracts process.env dot access usages', () => {
    expect(extract('const url = process.env.DATABASE_URL;\n')).toEqual([
      expectUsage('DATABASE_URL', '/repo/app/src/app.ts', 1),
    ]);
  });

  it('extracts process.env bracket access usages', () => {
    expect(extract("const url = process.env['REDIS_URL'];\n", '/repo/app/src/cache.ts')).toEqual([
      expectUsage('REDIS_URL', '/repo/app/src/cache.ts', 1),
    ]);
  });

  it('marks process.env nullish-coalescing fallbacks as optional', () => {
    expect(extract('const port = process.env.PORT ?? 3000;\n')).toEqual([
      expectUsage('PORT', '/repo/app/src/app.ts', 1, { optional: true, defaultValue: '3000' }),
    ]);
  });

  it('marks process.env logical-or fallbacks as optional', () => {
    expect(extract('const port = process.env.PORT || 3000;\n')).toEqual([
      expectUsage('PORT', '/repo/app/src/app.ts', 1, { optional: true, defaultValue: '3000' }),
    ]);
    expect(extract('const debug = process.env.DEBUG ?? true;\n')).toEqual([
      expectUsage('DEBUG', '/repo/app/src/app.ts', 1, { optional: true, defaultValue: 'true' }),
    ]);
    expect(extract('const apiKey = process.env.API_KEY || "fallback";\n')).toEqual([
      expectUsage('API_KEY', '/repo/app/src/app.ts', 1, { optional: true, defaultValue: 'fallback' }),
    ]);
  });

  it('ignores dynamic process.env access', () => {
    expect(extract('const key = "PORT"; const value = process.env[key];\n')).toEqual([]);
  });

  it('extracts multiple usages in one file', () => {
    const usages = extract('const a = process.env.DATABASE_URL;\nconst b = process.env.JWT_SECRET;\n');

    expect(usages).toHaveLength(2);
    expect(usages.map((usage) => usage.name)).toEqual(['DATABASE_URL', 'JWT_SECRET']);
    expect(usages.every((usage) => usage.optional === false)).toBe(true);
  });
});
