import { NodeFileSystemReader } from './filesystem/node-file-system-reader.js';
import type { FileSystemReader } from './interfaces/file-system-reader.js';
import type { ProjectDiscoveryService } from './interfaces/project-discovery-service.js';
import type { ProjectMarkerDetector } from './interfaces/project-marker-detector.js';
import type { WorkspaceManagerDetector } from './interfaces/workspace-manager-detector.js';
import { createDefaultProjectMarkerDetectors } from './project-markers/index.js';
import {
  DefaultProjectDiscoveryService,
  type ProjectDiscoveryDependencies,
} from './project-discovery-service.js';
import { createDefaultWorkspaceDetectors } from './workspace-detectors/index.js';

export function createDefaultProjectDiscoveryDependencies(): ProjectDiscoveryDependencies {
  const fileSystem = new NodeFileSystemReader();

  return {
    fileSystem,
    workspaceDetectors: createDefaultWorkspaceDetectors(fileSystem),
    projectDetectors: createDefaultProjectMarkerDetectors(fileSystem),
  };
}

export function createProjectDiscoveryService(
  deps?: Partial<ProjectDiscoveryDependencies>,
): ProjectDiscoveryService {
  const defaults = createDefaultProjectDiscoveryDependencies();

  return new DefaultProjectDiscoveryService({
    fileSystem: deps?.fileSystem ?? defaults.fileSystem,
    workspaceDetectors: deps?.workspaceDetectors ?? defaults.workspaceDetectors,
    projectDetectors: deps?.projectDetectors ?? defaults.projectDetectors,
  });
}

export type { ProjectDiscoveryDependencies, FileSystemReader, WorkspaceManagerDetector, ProjectMarkerDetector };
