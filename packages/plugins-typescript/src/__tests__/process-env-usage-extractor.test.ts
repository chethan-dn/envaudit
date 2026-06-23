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

  it('extracts process.env dot access usages', () => {
    expect(extract('const url = process.env.DATABASE_URL;\n')).toEqual([
      {
        name: 'DATABASE_URL',
        sourceFile: '/repo/app/src/app.ts',
        projectRootPath,
        line: 1,
        confidence: 'high',
        usageType: 'env',
      },
    ]);
  });

  it('extracts process.env bracket access usages', () => {
    expect(extract("const url = process.env['REDIS_URL'];\n", '/repo/app/src/cache.ts')).toEqual([
      {
        name: 'REDIS_URL',
        sourceFile: '/repo/app/src/cache.ts',
        projectRootPath,
        line: 1,
        confidence: 'high',
        usageType: 'env',
      },
    ]);
  });

  it('ignores dynamic process.env access', () => {
    expect(extract('const key = "PORT"; const value = process.env[key];\n')).toEqual([]);
  });

  it('extracts multiple usages in one file', () => {
    const usages = extract('const a = process.env.DATABASE_URL;\nconst b = process.env.JWT_SECRET;\n');

    expect(usages).toHaveLength(2);
    expect(usages.map((usage) => usage.name)).toEqual(['DATABASE_URL', 'JWT_SECRET']);
  });
});
