import type { EnvDoctorConfig } from './envdoctor-config.js';
import type { ScanExclusionPolicy } from './scan-exclusion-policy.js';
import { DEFAULT_SCAN_EXCLUDES } from './default-scan-excludes.js';

export function createScanExclusionPolicy(config: EnvDoctorConfig = {}): ScanExclusionPolicy {
  const patterns = dedupePatterns([...DEFAULT_SCAN_EXCLUDES, ...(config.exclude ?? [])]);
  return createDefaultScanExclusionPolicy(patterns);
}

export function createDefaultScanExclusionPolicy(patterns: readonly string[]): ScanExclusionPolicy {
  return new DefaultScanExclusionPolicy(patterns);
}

class DefaultScanExclusionPolicy implements ScanExclusionPolicy {
  constructor(private readonly patterns: readonly string[]) {}

  getIgnorePatterns(): readonly string[] {
    return this.patterns;
  }

  partition(paths: string[]): { included: string[]; excluded: string[] } {
    const included: string[] = [];
    const excluded: string[] = [];

    for (const path of paths) {
      if (this.isExcluded(path)) {
        excluded.push(path);
      } else {
        included.push(path);
      }
    }

    return { included, excluded };
  }

  private isExcluded(path: string): boolean {
    const normalized = path.replace(/\\/g, '/');
    return this.patterns.some((pattern) => matchGlobPattern(normalized, pattern));
  }
}

function dedupePatterns(patterns: string[]): string[] {
  return [...new Set(patterns)];
}

function matchGlobPattern(path: string, pattern: string): boolean {
  const normalizedPattern = pattern.replace(/\\/g, '/');

  if (normalizedPattern.includes('/')) {
    return matchPathPattern(path, normalizedPattern);
  }

  const fileName = path.split('/').at(-1) ?? path;
  return matchPathPattern(fileName, normalizedPattern) || matchPathPattern(path, `**/${normalizedPattern}`);
}

function matchPathPattern(path: string, pattern: string): boolean {
  const regex = globToRegExp(pattern);
  return regex.test(path);
}

function globToRegExp(pattern: string): RegExp {
  let regex = '^';
  let index = 0;

  while (index < pattern.length) {
    const char = pattern[index];

    if (char === '*') {
      const next = pattern[index + 1];
      if (next === '*') {
        if (pattern[index + 2] === '/') {
          regex += '(?:.+/)*';
          index += 3;
        } else {
          regex += '.*';
          index += 2;
        }
        continue;
      }

      regex += '[^/]*';
      index += 1;
      continue;
    }

    if (char === '?') {
      regex += '[^/]';
      index += 1;
      continue;
    }

    regex += escapeRegExp(char);
    index += 1;
  }

  regex += '$';
  return new RegExp(regex);
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}
