import { resolve } from 'node:path';
import type { ScannerPlugin, VariableUsage } from '@envdoctor/contracts';
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

  constructor(private readonly deps: TypeScriptScannerDependencies) {}

  async detect(rootPath: string): Promise<boolean> {
    const sourceFiles = await this.deps.sourceFileDiscoverer.discover(rootPath);
    return sourceFiles.length > 0;
  }

  async scan(rootPath: string): Promise<VariableUsage[]> {
    const normalizedRoot = resolve(rootPath);
    const sourceFilePaths = await this.deps.sourceFileDiscoverer.discover(normalizedRoot);

    if (sourceFilePaths.length === 0) {
      return [];
    }

    const project = createTsMorphProject();
    const sourceFiles = addSourceFiles(project, sourceFilePaths);
    const usages: VariableUsage[] = [];

    for (const sourceFile of sourceFiles) {
      usages.push(...this.deps.usageExtractor.extract(sourceFile, normalizedRoot));
    }

    return sortUsages(usages);
  }
}

export function createDefaultTypeScriptScannerDependencies(): TypeScriptScannerDependencies {
  return {
    sourceFileDiscoverer: new FastGlobSourceFileDiscoverer(),
    usageExtractor: new ProcessEnvUsageExtractor(),
  };
}

export function createTypeScriptScannerPlugin(
  deps?: Partial<TypeScriptScannerDependencies>,
): ScannerPlugin {
  const defaults = createDefaultTypeScriptScannerDependencies();

  return new TypeScriptScannerPlugin({
    sourceFileDiscoverer: deps?.sourceFileDiscoverer ?? defaults.sourceFileDiscoverer,
    usageExtractor: deps?.usageExtractor ?? defaults.usageExtractor,
  });
}
