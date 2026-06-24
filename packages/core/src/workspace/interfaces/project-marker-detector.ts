import type { WorkspaceProject } from '@envaudit/contracts';

export interface ProjectMarkerDetector {
  readonly id: string;
  readonly markerFile: string;
  detect(projectPath: string): Promise<boolean>;
  resolve(projectPath: string): Promise<WorkspaceProject>;
}
