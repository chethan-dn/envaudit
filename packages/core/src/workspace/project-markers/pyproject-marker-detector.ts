import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from 'envanalyser-contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';

export class PyprojectMarkerDetector implements ProjectMarkerDetector {
  readonly id = 'pyproject';
  readonly markerFile = 'pyproject.toml';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(projectPath: string): Promise<boolean> {
    return this.fs.exists(resolve(projectPath, this.markerFile));
  }

  async resolve(projectPath: string): Promise<WorkspaceProject> {
    const content = await this.fs.readFile(resolve(projectPath, this.markerFile));
    const name = parsePyprojectName(content) ?? basename(projectPath);

    return {
      name,
      rootPath: projectPath,
      type: 'python',
      language: 'python',
    };
  }
}

function parsePyprojectName(content: string): string | undefined {
  const match = content.match(/^\s*name\s*=\s*["']([^"']+)["']/m);
  return match?.[1];
}
