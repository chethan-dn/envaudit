import { basename } from 'node:path';
import type { EnvAuditConfig, EnvFileKind } from '@envaudit/contracts';
import { DEFAULT_DOCUMENTATION_ENV_FILES } from '@envaudit/contracts';
import { ENV_FILE_WILDCARD_PATTERN } from '../constants.js';
import { isEnvFile } from './env-file-matcher.js';

export function classifyEnvFile(fileName: string, config: EnvAuditConfig = {}): EnvFileKind {
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

export function getDocumentationEnvFiles(config: EnvAuditConfig = {}): string[] {
  return [...new Set([...DEFAULT_DOCUMENTATION_ENV_FILES, ...(config.documentationEnvFiles ?? [])])];
}

export function getEnvFileKind(sourceFile: string, config: EnvAuditConfig = {}): EnvFileKind {
  return classifyEnvFile(basename(sourceFile), config);
}
