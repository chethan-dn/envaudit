import { describe, expect, it } from 'vitest';
import { compareEnvFiles, isEnvFile } from '../discovery/env-file-matcher.js';

describe('env-file-matcher', () => {
  it('matches explicit env file names', () => {
    expect(isEnvFile('.env')).toBe(true);
    expect(isEnvFile('.env.local')).toBe(true);
    expect(isEnvFile('.env.production')).toBe(true);
    expect(isEnvFile('.env.example')).toBe(true);
  });

  it('matches wildcard env file names', () => {
    expect(isEnvFile('.env.docker')).toBe(true);
  });

  it('rejects non-env files', () => {
    expect(isEnvFile('package.json')).toBe(false);
    expect(isEnvFile('.env.')).toBe(false);
    expect(isEnvFile('env')).toBe(false);
  });

  it('sorts explicit env files before wildcard files', () => {
    const sorted = [
      '/repo/.env.docker',
      '/repo/.env',
      '/repo/.env.local',
    ].sort(compareEnvFiles);

    expect(sorted).toEqual(['/repo/.env', '/repo/.env.local', '/repo/.env.docker']);
  });
});
