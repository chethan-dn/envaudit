import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { EnvDoctorConfig } from '@envdoctor/contracts';
import { DEFAULT_ENV_DOCTOR_CONFIG } from './default-envdoctor-config.js';
import type { EnvDoctorConfigLoader } from './interfaces/envdoctor-config-loader.js';

const CONFIG_FILE_NAME = '.envdoctor.json';

export class DefaultEnvDoctorConfigLoader implements EnvDoctorConfigLoader {
  async load(repositoryRootPath: string): Promise<EnvDoctorConfig> {
    const configPath = resolve(repositoryRootPath, CONFIG_FILE_NAME);

    let raw: string;
    try {
      raw = await readFile(configPath, 'utf8');
    } catch (error) {
      if (isNotFoundError(error)) {
        return DEFAULT_ENV_DOCTOR_CONFIG;
      }

      throw error;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Invalid ${CONFIG_FILE_NAME}: malformed JSON`);
    }

    return validateEnvDoctorConfig(parsed);
  }
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

function validateEnvDoctorConfig(value: unknown): EnvDoctorConfig {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid .envdoctor.json: root value must be an object');
  }

  const record = value as Record<string, unknown>;
  const config: EnvDoctorConfig = {};

  if ('exclude' in record) {
    config.exclude = validateStringArray(record.exclude, 'exclude');
  }

  if ('documentationEnvFiles' in record) {
    config.documentationEnvFiles = validateStringArray(record.documentationEnvFiles, 'documentationEnvFiles');
  }

  return config;
}

function validateStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Invalid .envdoctor.json: "${fieldName}" must be an array of strings`);
  }

  return value;
}
