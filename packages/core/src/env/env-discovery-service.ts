import { resolve } from 'node:path';
import type {
  EnvDoctorConfig,
  EnvironmentFileSummary,
  VariableDefinition,
  WorkspaceProject,
} from '@envdoctor/contracts';
import type { FileSystemReader } from '../workspace/interfaces/file-system-reader.js';
import type { EnvDiscoveryProjectOptions, EnvDiscoveryService } from './interfaces/env-discovery-service.js';
import type { EnvDiscoveryResult } from './interfaces/env-discovery-result.js';
import type { EnvFileParser } from './interfaces/env-file-parser.js';
import { getEnvFileKind } from './discovery/env-file-classifier.js';
import { compareEnvFiles } from './discovery/env-file-matcher.js';
import { discoverEnvFilesInDirectory } from './discovery/discover-env-files-in-directory.js';
import { ProjectDirectoryNotFoundError } from './discovery/project-env-file-discoverer.js';

export class RuntimeEnvFileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`Runtime env file not found: ${filePath}`);
    this.name = 'RuntimeEnvFileNotFoundError';
  }
}

export interface EnvDiscoveryDependencies {
  fileSystem: FileSystemReader;
  envFileParser: EnvFileParser;
}

export class DefaultEnvDiscoveryService implements EnvDiscoveryService {
  constructor(private readonly deps: EnvDiscoveryDependencies) {}

  async discoverForProject(
    project: WorkspaceProject,
    options: EnvDiscoveryProjectOptions = {},
  ): Promise<EnvDiscoveryResult> {
    const config = options.config ?? {};
    const projectRootPath = resolve(project.rootPath);
    const workspaceRootPath = resolve(options.workspaceRootPath ?? projectRootPath);

    if (!(await this.deps.fileSystem.exists(projectRootPath))) {
      throw new ProjectDirectoryNotFoundError(projectRootPath);
    }

    const projectEnvFiles = await discoverEnvFilesInDirectory(this.deps.fileSystem, projectRootPath);
    const workspaceEnvFiles =
      workspaceRootPath !== projectRootPath
        ? await discoverEnvFilesInDirectory(this.deps.fileSystem, workspaceRootPath)
        : [];

    const discoveredPaths = dedupeSortedEnvFiles([...workspaceEnvFiles, ...projectEnvFiles]);
    const environmentFiles = classifyEnvFiles(discoveredPaths, config);

    let runtimeFilesToParse = environmentFiles.runtime;
    if (options.runtimeEnvOverridePath) {
      const overridePath = resolve(options.runtimeEnvOverridePath);
      if (!(await this.deps.fileSystem.exists(overridePath))) {
        throw new RuntimeEnvFileNotFoundError(overridePath);
      }

      runtimeFilesToParse = [overridePath];
      environmentFiles.runtime = [overridePath];
    }

    const filesToParse = dedupeSortedEnvFiles([
      ...runtimeFilesToParse,
      ...environmentFiles.documentation,
    ]);

    const definitions = await this.parseEnvFiles(filesToParse, projectRootPath, config);

    return {
      definitions,
      environmentFiles: hasDiscoveredEnvFiles(environmentFiles)
        ? environmentFiles
        : { runtime: [], documentation: [] },
    };
  }

  async discoverForProjects(
    projects: WorkspaceProject[],
    options: EnvDiscoveryProjectOptions = {},
  ): Promise<EnvDiscoveryResult[]> {
    const results: EnvDiscoveryResult[] = [];

    for (const project of projects) {
      results.push(await this.discoverForProject(project, options));
    }

    return results;
  }

  private async parseEnvFiles(
    sourceFiles: string[],
    projectRootPath: string,
    config: EnvDoctorConfig,
  ): Promise<VariableDefinition[]> {
    const definitions: VariableDefinition[] = [];

    for (const sourceFile of sourceFiles) {
      try {
        const content = await this.deps.fileSystem.readFile(sourceFile);
        const sourceKind = getEnvFileKind(sourceFile, config);
        definitions.push(
          ...this.deps.envFileParser
            .parse(sourceFile, content, projectRootPath)
            .map((definition) => ({
              ...definition,
              sourceKind,
              definitionSource: 'env-file' as const,
            })),
        );
      } catch {
        continue;
      }
    }

    return definitions;
  }
}

function classifyEnvFiles(
  discoveredPaths: string[],
  config: EnvDoctorConfig,
): EnvironmentFileSummary {
  const environmentFiles: EnvironmentFileSummary = {
    runtime: [],
    documentation: [],
  };

  for (const sourceFile of discoveredPaths) {
    const kind = getEnvFileKind(sourceFile, config);
    if (kind === 'documentation') {
      environmentFiles.documentation.push(sourceFile);
    } else {
      environmentFiles.runtime.push(sourceFile);
    }
  }

  return environmentFiles;
}

function dedupeSortedEnvFiles(paths: string[]): string[] {
  return [...new Set(paths.map((filePath) => resolve(filePath)))].sort(compareEnvFiles);
}

function hasDiscoveredEnvFiles(environmentFiles: EnvironmentFileSummary): boolean {
  return environmentFiles.runtime.length > 0 || environmentFiles.documentation.length > 0;
}
