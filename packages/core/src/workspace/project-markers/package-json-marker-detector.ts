import { basename, resolve } from 'node:path';
import type { ProjectLanguage, WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { ProjectMarkerDetector } from '../interfaces/project-marker-detector.js';

export class PackageJsonMarkerDetector implements ProjectMarkerDetector {
  readonly id = 'package-json';
  readonly markerFile = 'package.json';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(projectPath: string): Promise<boolean> {
    return this.fs.exists(resolve(projectPath, this.markerFile));
  }

  async resolve(projectPath: string): Promise<WorkspaceProject> {
    const packageJsonPath = resolve(projectPath, this.markerFile);
    const packageJson = await this.fs.readJson<{ name?: string }>(packageJsonPath);
    const language = await this.resolveLanguage(projectPath);

    return {
      name: packageJson.name ?? basename(projectPath),
      rootPath: projectPath,
      type: 'node',
      language,
    };
  }

  private async resolveLanguage(projectPath: string): Promise<ProjectLanguage> {
    const hasTsConfig = await this.fs.exists(resolve(projectPath, 'tsconfig.json'));
    if (hasTsConfig) {
      return 'typescript';
    }

    return 'javascript';
  }
}
