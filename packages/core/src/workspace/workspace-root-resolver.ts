import { dirname, resolve } from 'node:path';
import type { FileSystemReader } from './interfaces/file-system-reader.js';
import type { WorkspaceManagerDetector } from './interfaces/workspace-manager-detector.js';

export interface WorkspaceRootResolverDependencies {
  fileSystem: FileSystemReader;
  workspaceDetectors: WorkspaceManagerDetector[];
}

export class WorkspaceRootResolver {
  constructor(private readonly deps: WorkspaceRootResolverDependencies) {}

  async resolve(startPath: string): Promise<string> {
    let current = resolve(startPath);

    while (true) {
      for (const detector of this.deps.workspaceDetectors) {
        if (await detector.detect(current)) {
          return current;
        }
      }

      const parent = dirname(current);
      if (parent === current) {
        return resolve(startPath);
      }

      current = parent;
    }
  }
}
