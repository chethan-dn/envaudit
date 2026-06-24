import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from '@envaudit/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';

export class GradleMarkerDetector implements ProjectMarkerDetector {
  readonly id = 'gradle';
  readonly markerFile = 'build.gradle';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(projectPath: string): Promise<boolean> {
    if (await this.fs.exists(resolve(projectPath, this.markerFile))) {
      return true;
    }

    return this.fs.exists(resolve(projectPath, 'build.gradle.kts'));
  }

  async resolve(projectPath: string): Promise<WorkspaceProject> {
    return {
      name: basename(projectPath),
      rootPath: projectPath,
      type: 'java',
      language: 'java',
    };
  }
}
