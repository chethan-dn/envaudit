export interface WorkspaceProject {
  name: string;
  rootPath: string;
  type?: string;
  language?: string;
}

export interface ProjectDiscoveryResult {
  rootPath: string;
  projects: WorkspaceProject[];
}
