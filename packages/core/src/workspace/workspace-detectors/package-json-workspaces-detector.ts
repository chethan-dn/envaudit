import { resolve } from 'node:path';
import type { WorkspaceProject } from 'envaudit-contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { WorkspaceManagerDetector } from '../interfaces/workspace-manager-detector.js';
import { discoverFromWorkspacePatterns } from '../utils/discover-from-workspace-patterns.js';

interface PackageJsonWithWorkspaces {
  workspaces?: string[] | { packages?: string[] };
}

export class PackageJsonWorkspacesDetector implements WorkspaceManagerDetector {
  readonly id = 'package-json';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(rootPath: string): Promise<boolean> {
    const packageJsonPath = resolve(rootPath, 'package.json');
    if (!(await this.fs.exists(packageJsonPath))) {
      return false;
    }

    const packageJson = await this.fs.readJson<PackageJsonWithWorkspaces>(packageJsonPath);
    return getWorkspacePatterns(packageJson).length > 0;
  }

  async discover(rootPath: string): Promise<WorkspaceProject[]> {
    const packageJsonPath = resolve(rootPath, 'package.json');
    const packageJson = await this.fs.readJson<PackageJsonWithWorkspaces>(packageJsonPath);
    const patterns = getWorkspacePatterns(packageJson);

    if (patterns.length === 0) {
      return [];
    }

    return discoverFromWorkspacePatterns(this.fs, rootPath, patterns);
  }
}

export function getWorkspacePatterns(packageJson: PackageJsonWithWorkspaces): string[] {
  if (!packageJson.workspaces) {
    return [];
  }

  if (Array.isArray(packageJson.workspaces)) {
    return packageJson.workspaces;
  }

  return packageJson.workspaces.packages ?? [];
}
