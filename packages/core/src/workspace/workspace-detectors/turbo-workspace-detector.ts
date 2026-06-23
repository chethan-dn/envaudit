import { resolve } from 'node:path';
import type { WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { WorkspaceManagerDetector } from '../interfaces/workspace-manager-detector.js';
import {
  getWorkspacePatterns,
  PackageJsonWorkspacesDetector,
} from './package-json-workspaces-detector.js';

export class TurboWorkspaceDetector implements WorkspaceManagerDetector {
  readonly id = 'turbo';

  private readonly packageJsonWorkspacesDetector: PackageJsonWorkspacesDetector;

  constructor(private readonly fs: FileSystemReader) {
    this.packageJsonWorkspacesDetector = new PackageJsonWorkspacesDetector(fs);
  }

  async detect(rootPath: string): Promise<boolean> {
    return this.fs.exists(resolve(rootPath, 'turbo.json'));
  }

  async discover(rootPath: string): Promise<WorkspaceProject[]> {
    const packageJsonPath = resolve(rootPath, 'package.json');
    if (!(await this.fs.exists(packageJsonPath))) {
      return [];
    }

    const packageJson = await this.fs.readJson<Parameters<typeof getWorkspacePatterns>[0]>(
      packageJsonPath,
    );
    const patterns = getWorkspacePatterns(packageJson);

    if (patterns.length === 0) {
      return [];
    }

    return this.packageJsonWorkspacesDetector.discover(rootPath);
  }
}
