import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { WorkspaceManagerDetector } from '../interfaces/workspace-manager-detector.js';
import { NxWorkspaceDetector } from './nx-workspace-detector.js';
import { PackageJsonWorkspacesDetector } from './package-json-workspaces-detector.js';
import { PnpmWorkspaceDetector } from './pnpm-workspace-detector.js';
import { TurboWorkspaceDetector } from './turbo-workspace-detector.js';

export function createDefaultWorkspaceDetectors(
  fs: FileSystemReader,
): WorkspaceManagerDetector[] {
  return [
    new PnpmWorkspaceDetector(fs),
    new NxWorkspaceDetector(fs),
    new TurboWorkspaceDetector(fs),
    new PackageJsonWorkspacesDetector(fs),
  ];
}

export { NxWorkspaceDetector } from './nx-workspace-detector.js';
export { PackageJsonWorkspacesDetector } from './package-json-workspaces-detector.js';
export { PnpmWorkspaceDetector } from './pnpm-workspace-detector.js';
export { TurboWorkspaceDetector } from './turbo-workspace-detector.js';
