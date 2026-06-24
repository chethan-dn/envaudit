import { resolve } from 'node:path';
import type { WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../../workspace/interfaces/file-system-reader.js';
import type { EnvFileDiscoverer } from '../interfaces/env-file-discoverer.js';
import { compareEnvFiles, isEnvFile } from './env-file-matcher.js';

export class ProjectDirectoryNotFoundError extends Error {
  constructor(projectRootPath: string) {
    super(`Project directory not found: ${projectRootPath}`);
    this.name = 'ProjectDirectoryNotFoundError';
  }
}

export class ProjectEnvFileDiscoverer implements EnvFileDiscoverer {
  constructor(private readonly fs: FileSystemReader) {}

  async discover(project: WorkspaceProject): Promise<string[]> {
    const projectRootPath = resolve(project.rootPath);

    if (!(await this.fs.exists(projectRootPath))) {
      throw new ProjectDirectoryNotFoundError(projectRootPath);
    }

    let entries: string[];
    try {
      entries = await this.fs.readdir(projectRootPath);
    } catch {
      throw new ProjectDirectoryNotFoundError(projectRootPath);
    }

    return entries
      .filter((entry) => isEnvFile(entry))
      .map((entry) => resolve(projectRootPath, entry))
      .sort(compareEnvFiles);
  }
}
