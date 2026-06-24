import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { ConfigWrapperUsageExtractor } from '../config-wrapper-usage-extractor.js';
import type { ConfigWrapperMapping } from '../config-wrapper-mapping-extractor.js';

describe('ConfigWrapperUsageExtractor', () => {
  const mappings = new Map<string, ConfigWrapperMapping>([
    [
      'databaseUrl',
      {
        propertyName: 'databaseUrl',
        variable: 'DATABASE_URL',
        sourceFile: '/repo/app/src/app-config.service.ts',
        line: 2,
        optional: false,
      },
    ],
    [
      'openAiKey',
      {
        propertyName: 'openAiKey',
        variable: 'OPENAI_API_KEY',
        sourceFile: '/repo/app/src/app-config.service.ts',
        line: 3,
        optional: false,
      },
    ],
  ]);

  const extractor = new ConfigWrapperUsageExtractor(mappings);
  const projectRootPath = '/repo/app';

  function extract(content: string, filePath = '/repo/app/src/consumer.ts') {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(filePath, content);
    return extractor.extract(sourceFile, projectRootPath);
  }

  it('records env usage for this.appConfig.databaseUrl', () => {
    expect(
      extract(`export class Consumer {
  constructor(private readonly appConfig: { databaseUrl: string }) {}
  run() {
    return this.appConfig.databaseUrl;
  }
}
`),
    ).toEqual([
      {
        name: 'DATABASE_URL',
        sourceFile: '/repo/app/src/consumer.ts',
        projectRootPath,
        line: 4,
        confidence: 'high',
        usageType: 'env',
        optional: false,
      },
    ]);
  });

  it('records env usage for config.openAiKey', () => {
    expect(
      extract(`export class Consumer {
  run(config: { openAiKey: string }) {
    return config.openAiKey;
  }
}
`),
    ).toEqual([
      {
        name: 'OPENAI_API_KEY',
        sourceFile: '/repo/app/src/consumer.ts',
        projectRootPath,
        line: 3,
        confidence: 'high',
        usageType: 'env',
        optional: false,
      },
    ]);
  });
});
