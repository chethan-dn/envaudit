import { DEFAULT_IGNORED_DIRECTORIES } from '@envdoctor/contracts';

export function getGlobIgnorePatterns(): string[] {
  return DEFAULT_IGNORED_DIRECTORIES.map((dir) => `**/${dir}/**`);
}
