import { resolve } from 'node:path';
import type { ScanExclusionPolicy, ScanMetrics, ScannerPlugin, VariableDefinition, VariableUsage } from '@envaudit/contracts';
import {
  ConfigServiceUsageExtractor,
  ConfigWrapperMappingExtractor,
  ConfigWrapperUsageExtractor,
  collectConfigWrapperMappings,
  ValidationSchemaDefinitionExtractor,
  ValidationSchemaFileDiscoverer,
} from '@envaudit/plugins-nestjs';
import {
  FastGlobSourceFileDiscoverer,
  type SourceFileDiscoverer,
} from './discovery/source-file-discoverer.js';
import { CompositeUsageExtractor } from './scanner/composite-usage-extractor.js';
import {
  ProcessEnvUsageExtractor,
  type UsageExtractor,
} from './scanner/process-env-usage-extractor.js';
import { addSourceFiles, createTsMorphProject, sortUsages } from './scanner/ts-morph-project.js';

export interface TypeScriptScannerDependencies {
  sourceFileDiscoverer: SourceFileDiscoverer;
  usageExtractor: UsageExtractor;
  configWrapperMappingExtractor: ConfigWrapperMappingExtractor;
  validationSchemaFileDiscoverer: ValidationSchemaFileDiscoverer;
  validationSchemaDefinitionExtractor: ValidationSchemaDefinitionExtractor;
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
    const wrapperMappings = collectConfigWrapperMappings(
      sourceFiles,
      this.deps.configWrapperMappingExtractor,
    );
    const wrapperUsageExtractor = new ConfigWrapperUsageExtractor(wrapperMappings);
    const usages: VariableUsage[] = [];

    for (const sourceFile of sourceFiles) {
      usages.push(...this.deps.usageExtractor.extract(sourceFile, normalizedRoot));
      usages.push(...wrapperUsageExtractor.extract(sourceFile, normalizedRoot));
    }

    return sortUsages(usages);
  }

  async discoverDefinitions(rootPath: string): Promise<VariableDefinition[]> {
    const normalizedRoot = resolve(rootPath);
    const schemaFiles = await this.deps.validationSchemaFileDiscoverer.discover(normalizedRoot);

    if (schemaFiles.length === 0) {
      return [];
    }

    const project = createTsMorphProject();
    const definitions: VariableDefinition[] = [];

    for (const sourceFile of addSourceFiles(project, schemaFiles)) {
      definitions.push(
        ...this.deps.validationSchemaDefinitionExtractor.extract(sourceFile, normalizedRoot),
      );
    }

    return definitions;
  }

  getSourceScanMetrics(): ScanMetrics {
    return this.sourceScanMetrics;
  }
}

export interface CreateTypeScriptScannerPluginOptions {
  exclusionPolicy: ScanExclusionPolicy;
  sourceFileDiscoverer?: SourceFileDiscoverer;
  usageExtractor?: UsageExtractor;
  validationSchemaFileDiscoverer?: ValidationSchemaFileDiscoverer;
  validationSchemaDefinitionExtractor?: ValidationSchemaDefinitionExtractor;
  configWrapperMappingExtractor?: ConfigWrapperMappingExtractor;
}

export function createDefaultTypeScriptScannerDependencies(
  exclusionPolicy: ScanExclusionPolicy,
): TypeScriptScannerDependencies {
  return {
    sourceFileDiscoverer: new FastGlobSourceFileDiscoverer(exclusionPolicy),
    usageExtractor: new CompositeUsageExtractor([
      new ProcessEnvUsageExtractor(),
      new ConfigServiceUsageExtractor(),
    ]),
    validationSchemaFileDiscoverer: new ValidationSchemaFileDiscoverer(),
    validationSchemaDefinitionExtractor: new ValidationSchemaDefinitionExtractor(),
    configWrapperMappingExtractor: new ConfigWrapperMappingExtractor(),
  };
}

export function createTypeScriptScannerPlugin(
  options: CreateTypeScriptScannerPluginOptions,
): TypeScriptScannerPlugin {
  const defaults = createDefaultTypeScriptScannerDependencies(options.exclusionPolicy);

  return new TypeScriptScannerPlugin({
    sourceFileDiscoverer: options.sourceFileDiscoverer ?? defaults.sourceFileDiscoverer,
    usageExtractor: options.usageExtractor ?? defaults.usageExtractor,
    validationSchemaFileDiscoverer:
      options.validationSchemaFileDiscoverer ?? defaults.validationSchemaFileDiscoverer,
    validationSchemaDefinitionExtractor:
      options.validationSchemaDefinitionExtractor ?? defaults.validationSchemaDefinitionExtractor,
    configWrapperMappingExtractor:
      options.configWrapperMappingExtractor ?? defaults.configWrapperMappingExtractor,
  });
}
