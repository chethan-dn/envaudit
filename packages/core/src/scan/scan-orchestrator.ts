import { resolve } from 'node:path';
import type {
  EnvDoctorConfig,
  RepositoryScanResult,
  ScanMetrics,
  ScanResult,
  ScanExclusionPolicy,
  WorkspaceProject,
} from '@envdoctor/contracts';
import type { ScannerPlugin } from '@envdoctor/contracts';
import type { PluginScanService } from './interfaces/plugin-scan-service.js';
import type { ScanOrchestrator } from './interfaces/scan-orchestrator.js';
import type { ScanOptions } from './interfaces/scan-options.js';
import type { EnvDiscoveryService } from '../env/interfaces/env-discovery-service.js';
import type { IssueAnalysisService } from '../analysis/interfaces/issue-analysis-service.js';
import type { ProjectDiscoveryService } from '../workspace/interfaces/project-discovery-service.js';
import type { WorkspaceRootResolver } from '../workspace/workspace-root-resolver.js';
import type { EnvDoctorConfigLoader } from '../config/interfaces/envdoctor-config-loader.js';
import { createScanExclusionPolicy } from '@envdoctor/contracts';
import { buildRepositoryScanSummary } from './utils/build-repository-scan-summary.js';

export type PluginFactory = (exclusionPolicy: ScanExclusionPolicy) => ScannerPlugin[];

export interface ScanOrchestratorDependencies {
  configLoader: EnvDoctorConfigLoader;
  projectDiscovery: ProjectDiscoveryService;
  workspaceRootResolver: WorkspaceRootResolver;
  envDiscovery: EnvDiscoveryService;
  issueAnalysis: IssueAnalysisService;
  pluginScan: PluginScanService;
  createPlugins: PluginFactory;
}

export interface ScanContext {
  rootPath: string;
  config: EnvDoctorConfig;
  exclusionPolicy: ScanExclusionPolicy;
  workspaceRootPath: string;
}

export class DefaultScanOrchestrator implements ScanOrchestrator {
  constructor(private readonly deps: ScanOrchestratorDependencies) {}

  async scan(repositoryPath: string, options?: ScanOptions): Promise<RepositoryScanResult> {
    const context = await this.createScanContext(repositoryPath);
    const plugins = this.deps.createPlugins(context.exclusionPolicy);
    const discovery = await this.deps.projectDiscovery.discover(context.rootPath);
    const results: ScanResult[] = [];

    for (const project of discovery.projects) {
      results.push(await this.scanProject(project, context, plugins, options));
    }

    return {
      rootPath: context.rootPath,
      results,
      summary: buildRepositoryScanSummary(results),
    };
  }

  private async createScanContext(repositoryPath: string): Promise<ScanContext> {
    const rootPath = resolve(repositoryPath);
    const config = await this.deps.configLoader.load(rootPath);
    const workspaceRootPath = await this.deps.workspaceRootResolver.resolve(rootPath);

    return {
      rootPath,
      config,
      exclusionPolicy: createScanExclusionPolicy(config),
      workspaceRootPath,
    };
  }

  private async scanProject(
    project: WorkspaceProject,
    context: ScanContext,
    plugins: ScannerPlugin[],
    options?: ScanOptions,
  ): Promise<ScanResult> {
    const envDiscovery = await this.deps.envDiscovery.discoverForProject(project, {
      config: context.config,
      workspaceRootPath: context.workspaceRootPath,
      runtimeEnvOverridePath: options?.runtimeEnvFile,
    });
    const pluginOutcome = await this.deps.pluginScan.scanProject(project, plugins);
    const definitions = [...envDiscovery.definitions, ...pluginOutcome.definitions];
    const envFileCount = new Set(
      envDiscovery.definitions.map((definition) => definition.sourceFile),
    ).size;
    const issues = this.deps.issueAnalysis.analyze({
      projectRootPath: project.rootPath,
      definitions,
      usages: pluginOutcome.usages,
      runtimeEnvFiles: envDiscovery.environmentFiles.runtime,
    });

    const metrics: ScanMetrics = {
      scannedFileCount: envFileCount + pluginOutcome.sourceMetrics.scannedFileCount,
      skippedFileCount: pluginOutcome.sourceMetrics.skippedFileCount,
    };

    const hasEnvironmentFiles =
      envDiscovery.environmentFiles.runtime.length > 0 ||
      envDiscovery.environmentFiles.documentation.length > 0;

    return {
      project,
      definitions,
      usages: pluginOutcome.usages,
      issues,
      metrics,
      ...(hasEnvironmentFiles ? { environmentFiles: envDiscovery.environmentFiles } : {}),
    };
  }
}
