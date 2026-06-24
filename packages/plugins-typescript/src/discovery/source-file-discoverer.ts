import { relative, resolve } from 'node:path';
import fg from 'fast-glob';
import type { ScanExclusionPolicy } from '@envaudit/contracts';
import { SUPPORTED_SOURCE_GLOB } from '../constants.js';

const MINIMAL_IGNORE_PATTERNS = ['**/node_modules/**', '**/.git/**'] as const;

export interface SourceDiscoveryOutcome {
  scannedFiles: string[];
  skippedFiles: string[];
}

export interface SourceFileDiscoverer {
  discover(rootPath: string): Promise<SourceDiscoveryOutcome>;
}

export class FastGlobSourceFileDiscoverer implements SourceFileDiscoverer {
  constructor(private readonly exclusionPolicy: ScanExclusionPolicy) {}

  async discover(rootPath: string): Promise<SourceDiscoveryOutcome> {
    const cwd = resolve(rootPath);
    const candidates = await fg(SUPPORTED_SOURCE_GLOB, {
      cwd,
      absolute: true,
      onlyFiles: true,
      ignore: [...MINIMAL_IGNORE_PATTERNS],
    });

    const relativeCandidates = candidates.map((candidate) => toPosixPath(relative(cwd, candidate)));
    const { included, excluded } = this.exclusionPolicy.partition(relativeCandidates);

    return {
      scannedFiles: included.map((entry) => resolve(cwd, entry)),
      skippedFiles: excluded.map((entry) => resolve(cwd, entry)),
    };
  }
}

function toPosixPath(value: string): string {
  return value.split('\\').join('/');
}
