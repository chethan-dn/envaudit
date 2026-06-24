import { resolve } from 'node:path';
import fg from 'fast-glob';
import { VALIDATION_SCHEMA_GLOBS } from '../constants.js';

const MINIMAL_IGNORE_PATTERNS = ['**/node_modules/**', '**/.git/**'] as const;

export class ValidationSchemaFileDiscoverer {
  async discover(projectRootPath: string): Promise<string[]> {
    const cwd = resolve(projectRootPath);

    return fg(VALIDATION_SCHEMA_GLOBS, {
      cwd,
      absolute: true,
      onlyFiles: true,
      ignore: [...MINIMAL_IGNORE_PATTERNS],
    });
  }
}
