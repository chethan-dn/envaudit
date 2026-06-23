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
import type { EnvDiscoveryService } from '../env/interfaces/env-discovery-service.js';
import type { IssueAnalysisService } from '../analysis/interfaces/issue-analysis-service.js';
import type { ProjectDiscoveryService } from '../workspace/interfaces/project-discovery-service.js';
import type { EnvDoctorConfigLoader } from '../config/interfaces/envdoctor-config-loader.js';
import { createScanExclusionPolicy } from '@envdoctor/contracts';
import { buildRepositoryScanSummary } from './utils/build-repository-scan-summary.js';

export type PluginFactory = (exclusionPolicy: ScanExclusionPolicy) => ScannerPlugin[];

export interface ScanOrchestratorDependencies {
  configLoader: EnvDoctorConfigLoader;
  projectDiscovery: ProjectDiscoveryService;
  envDiscovery: EnvDiscoveryService;
  issueAnalysis: IssueAnalysisService;
  pluginScan: PluginScanService;
  createPlugins: PluginFactory;
}

export interface ScanContext {
  rootPath: string;
  config: EnvDoctorConfig;
  exclusionPolicy: ScanExclusionPolicy;
}

export class DefaultScanOrchestrator implements ScanOrchestrator {
  constructor(private readonly deps: ScanOrchestratorDependencies) {}

  async scan(repositoryPath: string): Promise<RepositoryScanResult> {
    const context = await this.createScanContext(repositoryPath);
    const plugins = this.deps.createPlugins(context.exclusionPolicy);
    const discovery = await this.deps.projectDiscovery.discover(context.rootPath);
    const results: ScanResult[] = [];

    for (const project of discovery.projects) {
      results.push(await this.scanProject(project, context, plugins));
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

    return {
      rootPath,
      config,
      exclusionPolicy: createScanExclusionPolicy(config),
    };
  }

  private async scanProject(
    project: WorkspaceProject,
    context: ScanContext,
    plugins: ScannerPlugin[],
  ): Promise<ScanResult> {
    const definitions = await this.deps.envDiscovery.discoverForProject(project, context.config);
    const envFileCount = new Set(definitions.map((definition) => definition.sourceFile)).size;
    const pluginOutcome = await this.deps.pluginScan.scanProject(project, plugins);
    const issues = this.deps.issueAnalysis.analyze({
      projectRootPath: project.rootPath,
      definitions,
      usages: pluginOutcome.usages,
    });

    const metrics: ScanMetrics = {
      scannedFileCount: envFileCount + pluginOutcome.sourceMetrics.scannedFileCount,
      skippedFileCount: pluginOutcome.sourceMetrics.skippedFileCount,
    };

    return {
      project,
      definitions,
      usages: pluginOutcome.usages,
      issues,
      metrics,
    };
  }
}
