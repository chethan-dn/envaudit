import type { WorkspaceProject } from 'envaudit-contracts';

export interface WorkspaceManagerDetector {
  readonly id: string;
  detect(rootPath: string): Promise<boolean>;
  discover(rootPath: string): Promise<WorkspaceProject[]>;
}
