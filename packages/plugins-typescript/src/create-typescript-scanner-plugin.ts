import { resolve } from 'node:path';
import type { ScanExclusionPolicy, ScanMetrics, ScannerPlugin, VariableUsage } from '@envdoctor/contracts';
import {
  FastGlobSourceFileDiscoverer,
  type SourceFileDiscoverer,
} from './discovery/source-file-discoverer.js';
import {
  ProcessEnvUsageExtractor,
  type UsageExtractor,
} from './scanner/process-env-usage-extractor.js';
import { addSourceFiles, createTsMorphProject, sortUsages } from './scanner/ts-morph-project.js';

export interface TypeScriptScannerDependencies {
  sourceFileDiscoverer: SourceFileDiscoverer;
  usageExtractor: UsageExtractor;
}

export class TypeScriptScannerPlugin implements ScannerPlugin {
  readonly id = 'typescript';
  readonly name = 'TypeScript / JavaScript';

  private sourceScanMetrics: ScanMetrics = {
    scannedFileCount: 0,
    skippedFileCount: 0,
  };

  constructor(private readonly deps: TypeScriptScannerDependencies) {}

  async detect(rootPath: string): Promise<boolean> {
    const outcome = await this.deps.sourceFileDiscoverer.discover(rootPath);
    return outcome.scannedFiles.length > 0;
  }

  async scan(rootPath: string): Promise<VariableUsage[]> {
    const normalizedRoot = resolve(rootPath);
    const outcome = await this.deps.sourceFileDiscoverer.discover(normalizedRoot);
    this.sourceScanMetrics = {
      scannedFileCount: outcome.scannedFiles.length,
      skippedFileCount: outcome.skippedFiles.length,
    };

    if (outcome.scannedFiles.length === 0) {
      return [];
    }

    const project = createTsMorphProject();
    const sourceFiles = addSourceFiles(project, outcome.scannedFiles);
    const usages: VariableUsage[] = [];

    for (const sourceFile of sourceFiles) {
      usages.push(...this.deps.usageExtractor.extract(sourceFile, normalizedRoot));
    }

    return sortUsages(usages);
  }

  getSourceScanMetrics(): ScanMetrics {
    return this.sourceScanMetrics;
  }
}

export interface CreateTypeScriptScannerPluginOptions {
  exclusionPolicy: ScanExclusionPolicy;
  sourceFileDiscoverer?: SourceFileDiscoverer;
  usageExtractor?: UsageExtractor;
}

export function createDefaultTypeScriptScannerDependencies(
  exclusionPolicy: ScanExclusionPolicy,
): TypeScriptScannerDependencies {
  return {
    sourceFileDiscoverer: new FastGlobSourceFileDiscoverer(exclusionPolicy),
    usageExtractor: new ProcessEnvUsageExtractor(),
  };
}

export function createTypeScriptScannerPlugin(
  options: CreateTypeScriptScannerPluginOptions,
): TypeScriptScannerPlugin {
  const defaults = createDefaultTypeScriptScannerDependencies(options.exclusionPolicy);

  return new TypeScriptScannerPlugin({
    sourceFileDiscoverer: options.sourceFileDiscoverer ?? defaults.sourceFileDiscoverer,
    usageExtractor: options.usageExtractor ?? defaults.usageExtractor,
  });
}
