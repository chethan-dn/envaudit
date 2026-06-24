import { Node, type PropertyAccessExpression, type SourceFile } from 'ts-morph';
import type { VariableUsage } from 'envaudit-contracts';
import { isPartOfConfigServiceCall } from './config-service-call-detection.js';
import type { ConfigWrapperMapping } from './config-wrapper-mapping-extractor.js';

export class ConfigWrapperUsageExtractor {
  constructor(private readonly mappings: ReadonlyMap<string, ConfigWrapperMapping>) {}

  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[] {
    if (this.mappings.size === 0) {
      return [];
    }

    const usages: VariableUsage[] = [];

    sourceFile.forEachDescendant((node) => {
      if (!Node.isPropertyAccessExpression(node)) {
        return;
      }

      if (isProcessEnvAccess(node) || isPartOfConfigServiceCall(node)) {
        return;
      }

      const mapping = this.mappings.get(node.getName());
      if (!mapping) {
        return;
      }

      usages.push(createUsage(mapping, sourceFile, projectRootPath, node));
    });

    return usages;
  }
}

function isProcessEnvAccess(node: PropertyAccessExpression): boolean {
  return (
    node.getName() === 'env' &&
    Node.isIdentifier(node.getExpression()) &&
    node.getExpression().getText() === 'process'
  );
}

function createUsage(
  mapping: ConfigWrapperMapping,
  sourceFile: SourceFile,
  projectRootPath: string,
  node: PropertyAccessExpression,
): VariableUsage {
  return {
    name: mapping.variable,
    sourceFile: sourceFile.getFilePath(),
    projectRootPath,
    line: node.getStartLineNumber(),
    confidence: 'high',
    usageType: 'env',
    optional: mapping.optional,
    ...(mapping.defaultValue !== undefined ? { defaultValue: mapping.defaultValue } : {}),
  };
}
