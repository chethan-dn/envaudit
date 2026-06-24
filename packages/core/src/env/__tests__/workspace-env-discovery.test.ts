import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { discoverEnvFilesInDirectory } from '../discovery/discover-env-files-in-directory.js';
import { classifyEnvFile } from '../discovery/env-file-classifier.js';
import { InMemoryFileSystemReader } from '../../workspace/__tests__/in-memory-file-system.js';

describe('discoverEnvFilesInDirectory', () => {
  it('discovers env files in a directory', async () => {
    const directoryPath = '/repo';
    const fs = new InMemoryFileSystemReader({
      [`${directoryPath}/.env`]: 'PORT=3000\n',
      [`${directoryPath}/.env.dev`]: 'DEBUG=true\n',
      [`${directoryPath}/.env.example`]: 'PORT=\n',
      [`${directoryPath}/package.json`]: '{}',
    });

    await expect(discoverEnvFilesInDirectory(fs, directoryPath)).resolves.toEqual([
      resolve(directoryPath, '.env'),
      resolve(directoryPath, '.env.example'),
      resolve(directoryPath, '.env.dev'),
    ]);
  });

  it('returns an empty list when the directory is missing', async () => {
    const fs = new InMemoryFileSystemReader();

    await expect(discoverEnvFilesInDirectory(fs, '/missing')).resolves.toEqual([]);
  });
});

describe('runtime and documentation classification', () => {
  it('classifies documentation env files', () => {
    expect(classifyEnvFile('.env.example')).toBe('documentation');
    expect(classifyEnvFile('.env.template')).toBe('documentation');
  });

  it('classifies runtime env files', () => {
    expect(classifyEnvFile('.env')).toBe('runtime');
    expect(classifyEnvFile('.env.local')).toBe('runtime');
    expect(classifyEnvFile('.env.dev')).toBe('runtime');
    expect(classifyEnvFile('.env.prod')).toBe('runtime');
    expect(classifyEnvFile('.env.preview')).toBe('runtime');
    expect(classifyEnvFile('.env.staging')).toBe('runtime');
    expect(classifyEnvFile('.env.test')).toBe('runtime');
  });
});
