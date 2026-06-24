import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { ConfigWrapperMappingExtractor } from '../config-wrapper-mapping-extractor.js';

describe('ConfigWrapperMappingExtractor', () => {
  const extractor = new ConfigWrapperMappingExtractor();

  function extract(content: string, filePath = '/repo/app/src/app-config.service.ts') {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(filePath, content);
    return extractor.extract(sourceFile);
  }

  it('maps getters that return configService.get', () => {
    expect(
      extract(`export class AppConfigService {
  get openAiKey(): string {
    return this.configService.get<string>("OPENAI_API_KEY");
  }
}
`),
    ).toEqual([
      {
        propertyName: 'openAiKey',
        variable: 'OPENAI_API_KEY',
        sourceFile: '/repo/app/src/app-config.service.ts',
        line: 2,
        optional: false,
      },
    ]);
  });

  it('maps getters that return configService.getOrThrow', () => {
    expect(
      extract(`export class AppConfigService {
  get databaseUrl(): string {
    return this.configService.getOrThrow<string>("DATABASE_URL");
  }
}
`),
    ).toEqual([
      {
        propertyName: 'databaseUrl',
        variable: 'DATABASE_URL',
        sourceFile: '/repo/app/src/app-config.service.ts',
        line: 2,
        optional: false,
      },
    ]);
  });

  it('maps getters that return config.get with an optional default', () => {
    expect(
      extract(`export class AppConfigService {
  get throttleLimit(): number {
    return this.config.get<number>("THROTTLE_LIMIT", 100);
  }
}
`),
    ).toEqual([
      {
        propertyName: 'throttleLimit',
        variable: 'THROTTLE_LIMIT',
        sourceFile: '/repo/app/src/app-config.service.ts',
        line: 2,
        optional: true,
        defaultValue: '100',
      },
    ]);
  });

  it('ignores unrelated getters', () => {
    expect(
      extract(`export class AppConfigService {
  get version(): string {
    return "1.0.0";
  }
}
`),
    ).toEqual([]);
  });

  it('ignores computed getters with multiple statements', () => {
    expect(
      extract(`export class AppConfigService {
  get databaseUrl(): string {
    const value = this.configService.getOrThrow<string>("DATABASE_URL");
    return value;
  }
}
`),
    ).toEqual([]);
  });
});
