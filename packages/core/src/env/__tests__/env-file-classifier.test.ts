import { describe, expect, it } from 'vitest';
import { classifyEnvFile, getEnvFileKind } from '../discovery/env-file-classifier.js';

describe('env-file-classifier', () => {
  it('classifies documentation env files', () => {
    expect(classifyEnvFile('.env.example')).toBe('documentation');
    expect(classifyEnvFile('.env.template')).toBe('documentation');
  });

  it('classifies runtime env files', () => {
    expect(classifyEnvFile('.env')).toBe('runtime');
    expect(classifyEnvFile('.env.local')).toBe('runtime');
    expect(classifyEnvFile('.env.test')).toBe('runtime');
    expect(classifyEnvFile('.env.development')).toBe('runtime');
  });

  it('supports custom documentation env files from config', () => {
    expect(
      classifyEnvFile('.env.sample', {
        documentationEnvFiles: ['.env.sample'],
      }),
    ).toBe('documentation');
  });

  it('derives kind from source file path', () => {
    expect(getEnvFileKind('/repo/apps/api/.env.example')).toBe('documentation');
    expect(getEnvFileKind('/repo/apps/api/.env')).toBe('runtime');
  });
});
