import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from '@envaudit/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';

export class RequirementsTxtMarkerDetector implements ProjectMarkerDetector {
  readonly id = 'requirements-txt';
  readonly markerFile = 'requirements.txt';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(projectPath: string): Promise<boolean> {
    return this.fs.exists(resolve(projectPath, this.markerFile));
  }

  async resolve(projectPath: string): Promise<WorkspaceProject> {
    return {
      name: basename(projectPath),
      rootPath: projectPath,
      type: 'python',
      language: 'python',
    };
  }
}
