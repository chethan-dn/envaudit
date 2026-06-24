import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from '@envaudit/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';

export class GoModMarkerDetector implements ProjectMarkerDetector {
  readonly id = 'go-mod';
  readonly markerFile = 'go.mod';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(projectPath: string): Promise<boolean> {
    return this.fs.exists(resolve(projectPath, this.markerFile));
  }

  async resolve(projectPath: string): Promise<WorkspaceProject> {
    return {
      name: basename(projectPath),
      rootPath: projectPath,
      type: 'go',
      language: 'go',
    };
  }
}
