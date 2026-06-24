import { basename } from 'node:path';
import type { EnvAnalyserConfig, EnvFileKind } from 'envanalyser-contracts';
import { DEFAULT_DOCUMENTATION_ENV_FILES } from 'envanalyser-contracts';
import { ENV_FILE_WILDCARD_PATTERN } from '../constants.js';
import { isEnvFile } from './env-file-matcher.js';

export function classifyEnvFile(fileName: string, config: EnvAnalyserConfig = {}): EnvFileKind {
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

export function getDocumentationEnvFiles(config: EnvAnalyserConfig = {}): string[] {
  return [...new Set([...DEFAULT_DOCUMENTATION_ENV_FILES, ...(config.documentationEnvFiles ?? [])])];
}

export function getEnvFileKind(sourceFile: string, config: EnvAnalyserConfig = {}): EnvFileKind {
  return classifyEnvFile(basename(sourceFile), config);
}
