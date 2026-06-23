import { resolve } from 'node:path';
import fg from 'fast-glob';
import { SUPPORTED_SOURCE_GLOB } from '../constants.js';
import { getGlobIgnorePatterns } from '../utils/get-glob-ignore-patterns.js';

export interface SourceFileDiscoverer {
  discover(rootPath: string): Promise<string[]>;
}

export class FastGlobSourceFileDiscoverer implements SourceFileDiscoverer {
  async discover(rootPath: string): Promise<string[]> {
    const cwd = resolve(rootPath);

    return fg(SUPPORTED_SOURCE_GLOB, {
      cwd,
      absolute: true,
      onlyFiles: true,
      ignore: getGlobIgnorePatterns(),
    });
  }
}
