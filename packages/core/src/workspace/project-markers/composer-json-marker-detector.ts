import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from 'envaudit-contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';

export class ComposerJsonMarkerDetector implements ProjectMarkerDetector {
  readonly id = 'composer-json';
  readonly markerFile = 'composer.json';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(projectPath: string): Promise<boolean> {
    return this.fs.exists(resolve(projectPath, this.markerFile));
  }

  async resolve(projectPath: string): Promise<WorkspaceProject> {
    const composerJsonPath = resolve(projectPath, this.markerFile);
    const composerJson = await this.fs.readJson<{ name?: string }>(composerJsonPath);

    return {
      name: composerJson.name ?? basename(projectPath),
      rootPath: projectPath,
      type: 'php',
      language: 'php',
    };
  }
}
