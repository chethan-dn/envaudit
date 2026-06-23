import { describe, expect, it } from 'vitest';
import { DotenvParser } from '../parser/dotenv-parser.js';

describe('DotenvParser', () => {
  const parser = new DotenvParser();
  const sourceFile = '/repo/.env';
  const projectRootPath = '/repo';

  it('parses unquoted assignments', () => {
    expect(parser.parse(sourceFile, 'DATABASE_URL=postgres\n', projectRootPath)).toEqual([
      {
        name: 'DATABASE_URL',
        value: 'postgres',
        sourceFile,
        projectRootPath,
        line: 1,
      },
    ]);
  });

  it('parses double-quoted assignments', () => {
    expect(parser.parse(sourceFile, 'DATABASE_URL="postgres"\n', projectRootPath)).toEqual([
      {
        name: 'DATABASE_URL',
        value: 'postgres',
        sourceFile,
        projectRootPath,
        line: 1,
      },
    ]);
  });

  it('parses single-quoted assignments', () => {
    expect(parser.parse(sourceFile, "DATABASE_URL='postgres'\n", projectRootPath)).toEqual([
      {
        name: 'DATABASE_URL',
        value: 'postgres',
        sourceFile,
        projectRootPath,
        line: 1,
      },
    ]);
  });

  it('parses export-prefixed assignments', () => {
    expect(parser.parse(sourceFile, 'export DATABASE_URL=postgres\n', projectRootPath)).toEqual([
      {
        name: 'DATABASE_URL',
        value: 'postgres',
        sourceFile,
        projectRootPath,
        line: 1,
      },
    ]);
  });

  it('skips comments and blank lines', () => {
    const content = '\n# comment\n\nPORT=3000\n';
    expect(parser.parse(sourceFile, content, projectRootPath)).toEqual([
      {
        name: 'PORT',
        value: '3000',
        sourceFile,
        projectRootPath,
        line: 4,
      },
    ]);
  });

  it('preserves empty values', () => {
    expect(parser.parse(sourceFile, 'PORT=\n', projectRootPath)).toEqual([
      {
        name: 'PORT',
        value: '',
        sourceFile,
        projectRootPath,
        line: 1,
      },
    ]);
  });

  it('stores interpolation syntax literally', () => {
    expect(parser.parse(sourceFile, 'API_URL=${BASE_URL}/api\n', projectRootPath)).toEqual([
      {
        name: 'API_URL',
        value: '${BASE_URL}/api',
        sourceFile,
        projectRootPath,
        line: 1,
      },
    ]);
  });

  it('emits one definition per duplicate assignment line', () => {
    const definitions = parser.parse(sourceFile, 'PORT=1\nPORT=2\n', projectRootPath);

    expect(definitions).toHaveLength(2);
    expect(definitions[0]?.line).toBe(1);
    expect(definitions[1]?.line).toBe(2);
  });

  it('skips malformed lines', () => {
    const definitions = parser.parse(sourceFile, 'INVALID\nPORT=3000\n', projectRootPath);

    expect(definitions).toEqual([
      {
        name: 'PORT',
        value: '3000',
        sourceFile,
        projectRootPath,
        line: 2,
      },
    ]);
  });
});
