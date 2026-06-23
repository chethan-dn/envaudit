import { basename } from 'node:path';
import { ENV_FILE_NAMES } from '../constants.js';

export function isEnvFile(fileName: string): boolean {
  if ((ENV_FILE_NAMES as readonly string[]).includes(fileName)) {
    return true;
  }

  return /^\.env\.[A-Za-z0-9_-]+$/.test(fileName);
}

export function compareEnvFiles(a: string, b: string): number {
  const baseA = basename(a);
  const baseB = basename(b);

  const indexA = ENV_FILE_NAMES.indexOf(baseA as (typeof ENV_FILE_NAMES)[number]);
  const indexB = ENV_FILE_NAMES.indexOf(baseB as (typeof ENV_FILE_NAMES)[number]);

  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }

  if (indexA !== -1) {
    return -1;
  }

  if (indexB !== -1) {
    return 1;
  }

  return baseA.localeCompare(baseB);
}
