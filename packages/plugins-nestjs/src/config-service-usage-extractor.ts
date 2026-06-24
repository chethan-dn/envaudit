import { Node, type CallExpression, type SourceFile } from 'ts-morph';
import type { VariableUsage } from '@envdoctor/contracts';

const CONFIG_METHODS = new Set(['get', 'getOrThrow']);
const CONFIG_OBJECT_NAMES = new Set(['configService', 'config']);

export class ConfigServiceUsageExtractor {
  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[] {
    const usages: VariableUsage[] = [];

    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const variableName = getConfigServiceCallVariableName(node);
      if (variableName) {
        usages.push(createUsage(variableName, sourceFile, projectRootPath, node));
      }
    });

    return usages;
  }
}

function getConfigServiceCallVariableName(node: CallExpression): string | null {
  const expression = node.getExpression();
  if (!Node.isPropertyAccessExpression(expression)) {
    return null;
  }

  if (!CONFIG_METHODS.has(expression.getName())) {
    return null;
  }

  if (!isConfigServiceReceiver(expression.getExpression())) {
    return null;
  }

  const firstArgument = node.getArguments()[0];
  if (!firstArgument) {
    return null;
  }

  if (Node.isStringLiteral(firstArgument) || Node.isNoSubstitutionTemplateLiteral(firstArgument)) {
    return firstArgument.getLiteralText();
  }

  return null;
}

function isConfigServiceReceiver(node: import('ts-morph').Node): boolean {
  if (Node.isIdentifier(node)) {
    return CONFIG_OBJECT_NAMES.has(node.getText());
  }

  if (Node.isPropertyAccessExpression(node)) {
    return Node.isThisExpression(node.getExpression()) && CONFIG_OBJECT_NAMES.has(node.getName());
  }

  return false;
}

function createUsage(
  name: string,
  sourceFile: SourceFile,
  projectRootPath: string,
  node: CallExpression,
): VariableUsage {
  return {
    name,
    sourceFile: sourceFile.getFilePath(),
    projectRootPath,
    line: node.getStartLineNumber(),
    confidence: 'high',
    usageType: 'env',
  };
}
