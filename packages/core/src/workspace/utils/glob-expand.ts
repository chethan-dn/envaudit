import { DEFAULT_IGNORED_DIRECTORIES } from '@envaudit/contracts';
import { resolve } from 'node:path';
import fg from 'fast-glob';

export function getGlobIgnorePatterns(): string[] {
  return DEFAULT_IGNORED_DIRECTORIES.map((dir) => `**/${dir}/**`);
}

export async function expandWorkspaceGlobs(
  rootPath: string,
  patterns: string[],
): Promise<string[]> {
  const cwd = resolve(rootPath);
  const ignore = getGlobIgnorePatterns();

  const results = await Promise.all(
    patterns.map(async (pattern) => {
      const trimmed = pattern.trim();
      if (!trimmed) {
        return [];
      }

      if (!trimmed.includes('*')) {
        return [resolve(cwd, trimmed)];
      }

      const matches = await fg(trimmed, {
        cwd,
        onlyDirectories: true,
        absolute: true,
        ignore,
      });

      return matches;
    }),
  );

  const unique = [...new Set(results.flat())];
  return unique.sort();
}
