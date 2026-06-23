import { resolve } from 'node:path';
import type { RepositoryScanResult, ScanResult, WorkspaceProject } from '@envdoctor/contracts';
import type { ScannerPlugin } from '@envdoctor/contracts';
import type { PluginScanService } from './interfaces/plugin-scan-service.js';
import type { ScanOrchestrator } from './interfaces/scan-orchestrator.js';
import type { EnvDiscoveryService } from '../env/interfaces/env-discovery-service.js';
import type { IssueAnalysisService } from '../analysis/interfaces/issue-analysis-service.js';
import type { ProjectDiscoveryService } from '../workspace/interfaces/project-discovery-service.js';
import { buildRepositoryScanSummary } from './utils/build-repository-scan-summary.js';

export interface ScanOrchestratorDependencies {
  projectDiscovery: ProjectDiscoveryService;
  envDiscovery: EnvDiscoveryService;
  issueAnalysis: IssueAnalysisService;
  pluginScan: PluginScanService;
  plugins: ScannerPlugin[];
}

export class DefaultScanOrchestrator implements ScanOrchestrator {
  constructor(private readonly deps: ScanOrchestratorDependencies) {}

  async scan(repositoryPath: string): Promise<RepositoryScanResult> {
    const rootPath = resolve(repositoryPath);
    const discovery = await this.deps.projectDiscovery.discover(rootPath);
    const results: ScanResult[] = [];

    for (const project of discovery.projects) {
      results.push(await this.scanProject(project));
    }

    return {
      rootPath,
      results,
      summary: buildRepositoryScanSummary(results),
    };
  }

  private async scanProject(project: WorkspaceProject): Promise<ScanResult> {
    const definitions = await this.deps.envDiscovery.discoverForProject(project);
    const pluginOutcome = await this.deps.pluginScan.scanProject(project, this.deps.plugins);
    const issues = this.deps.issueAnalysis.analyze({
      projectRootPath: project.rootPath,
      definitions,
      usages: pluginOutcome.usages,
    });

    return {
      project,
      definitions,
      usages: pluginOutcome.usages,
      issues,
    };
  }
}
