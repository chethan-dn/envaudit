import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from 'envanalyser-contracts';
import type { FileSystemReader } from './interfaces/file-system-reader.js';
import type { ProjectDiscoveryService } from './interfaces/project-discovery-service.js';
import type { ProjectMarkerDetector } from './interfaces/project-marker-detector.js';
import type { WorkspaceManagerDetector } from './interfaces/workspace-manager-detector.js';

export interface ProjectDiscoveryDependencies {
  fileSystem: FileSystemReader;
  workspaceDetectors: WorkspaceManagerDetector[];
  projectDetectors: ProjectMarkerDetector[];
}

export class DefaultProjectDiscoveryService implements ProjectDiscoveryService {
  constructor(private readonly deps: ProjectDiscoveryDependencies) {}

  async discover(rootPath: string) {
    const normalizedRoot = resolve(rootPath);
    const workspaceProjects = await this.discoverFromWorkspaceManagers(normalizedRoot);

    if (workspaceProjects !== null) {
      const enriched = await this.enrichProjects(workspaceProjects);
      return {
        rootPath: normalizedRoot,
        projects: enriched,
      };
    }

    const rootProject = await this.resolveProjectAtPath(normalizedRoot);
    if (rootProject) {
      return {
        rootPath: normalizedRoot,
        projects: [rootProject],
      };
    }

    return {
      rootPath: normalizedRoot,
      projects: [
        {
          name: basename(normalizedRoot),
          rootPath: normalizedRoot,
        },
      ],
    };
  }

  private async discoverFromWorkspaceManagers(
    rootPath: string,
  ): Promise<WorkspaceProject[] | null> {
    for (const detector of this.deps.workspaceDetectors) {
      if (!(await detector.detect(rootPath))) {
        continue;
      }

      const projects = await detector.discover(rootPath);
      if (projects.length > 0) {
        return projects;
      }
    }

    return null;
  }

  private async enrichProjects(projects: WorkspaceProject[]): Promise<WorkspaceProject[]> {
    const enriched: WorkspaceProject[] = [];
    const seen = new Set<string>();

    for (const project of projects) {
      const normalizedPath = resolve(project.rootPath);
      if (seen.has(normalizedPath)) {
        continue;
      }

      const resolved = await this.resolveProjectAtPath(normalizedPath);
      seen.add(normalizedPath);
      enriched.push(
        resolved ?? {
          name: project.name ?? basename(normalizedPath),
          rootPath: normalizedPath,
        },
      );
    }

    return enriched.sort((a, b) => a.rootPath.localeCompare(b.rootPath));
  }

  private async resolveProjectAtPath(projectPath: string): Promise<WorkspaceProject | null> {
    const normalizedPath = resolve(projectPath);

    for (const detector of this.deps.projectDetectors) {
      if (await detector.detect(normalizedPath)) {
        return detector.resolve(normalizedPath);
      }
    }

    return null;
  }
}
