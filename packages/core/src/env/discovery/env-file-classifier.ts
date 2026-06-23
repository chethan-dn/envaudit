import { basename } from 'node:path';
import type { EnvDoctorConfig, EnvFileKind } from '@envdoctor/contracts';
import { DEFAULT_DOCUMENTATION_ENV_FILES } from '@envdoctor/contracts';
import { ENV_FILE_WILDCARD_PATTERN } from '../constants.js';
import { isEnvFile } from './env-file-matcher.js';

export function classifyEnvFile(fileName: string, config: EnvDoctorConfig = {}): EnvFileKind {
  if (!isEnvFile(fileName)) {
    return 'runtime';
  }

  const documentationFiles = getDocumentationEnvFiles(config);
  if (documentationFiles.includes(fileName)) {
    return 'documentation';
  }

  if (ENV_FILE_WILDCARD_PATTERN.test(fileName)) {
    return 'runtime';
  }

  return 'runtime';
}

export function getDocumentationEnvFiles(config: EnvDoctorConfig = {}): string[] {
  return [...new Set([...DEFAULT_DOCUMENTATION_ENV_FILES, ...(config.documentationEnvFiles ?? [])])];
}

export function getEnvFileKind(sourceFile: string, config: EnvDoctorConfig = {}): EnvFileKind {
  return classifyEnvFile(basename(sourceFile), config);
}
