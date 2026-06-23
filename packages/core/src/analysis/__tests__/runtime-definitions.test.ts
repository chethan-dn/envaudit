import { describe, expect, it } from 'vitest';
import { getRuntimeDefinitions, isRuntimeDefinition } from '../utils/runtime-definitions.js';

describe('runtime-definitions', () => {
  it('filters documentation definitions', () => {
    const definitions = [
      {
        name: 'DATABASE_URL',
        value: 'replace-me',
        sourceFile: '/repo/.env.example',
        projectRootPath: '/repo',
        sourceKind: 'documentation' as const,
      },
      {
        name: 'DATABASE_URL',
        value: 'postgres://localhost',
        sourceFile: '/repo/.env',
        projectRootPath: '/repo',
        sourceKind: 'runtime' as const,
      },
    ];

    expect(getRuntimeDefinitions(definitions)).toEqual([definitions[1]]);
  });

  it('treats missing sourceKind as runtime', () => {
    const definition = {
      name: 'PORT',
      value: '3000',
      sourceFile: '/repo/.env',
      projectRootPath: '/repo',
    };

    expect(isRuntimeDefinition(definition)).toBe(true);
    expect(getRuntimeDefinitions([definition])).toEqual([definition]);
  });
});
