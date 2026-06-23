import type { VariableDefinition, WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../workspace/interfaces/file-system-reader.js';
import type { EnvDiscoveryService } from './interfaces/env-discovery-service.js';
import type { EnvFileDiscoverer } from './interfaces/env-file-discoverer.js';
import type { EnvFileParser } from './interfaces/env-file-parser.js';

export interface EnvDiscoveryDependencies {
  fileSystem: FileSystemReader;
  envFileDiscoverer: EnvFileDiscoverer;
  envFileParser: EnvFileParser;
}

export class DefaultEnvDiscoveryService implements EnvDiscoveryService {
  constructor(private readonly deps: EnvDiscoveryDependencies) {}

  async discoverForProject(project: WorkspaceProject): Promise<VariableDefinition[]> {
    const sourceFiles = await this.deps.envFileDiscoverer.discover(project);
    const definitions: VariableDefinition[] = [];

    for (const sourceFile of sourceFiles) {
      try {
        const content = await this.deps.fileSystem.readFile(sourceFile);
        definitions.push(
          ...this.deps.envFileParser.parse(sourceFile, content, project.rootPath),
        );
      } catch {
        continue;
      }
    }

    return definitions;
  }

  async discoverForProjects(projects: WorkspaceProject[]): Promise<VariableDefinition[]> {
    const definitions: VariableDefinition[] = [];

    for (const project of projects) {
      definitions.push(...(await this.discoverForProject(project)));
    }

    return definitions;
  }
}
