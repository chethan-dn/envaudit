import type { ProjectLanguage } from './project-language.js';

export interface WorkspaceProject {
  name: string;
  rootPath: string;
  type?: string;
  language?: ProjectLanguage;
}

export interface ProjectDiscoveryResult {
  rootPath: string;
  projects: WorkspaceProject[];
}
