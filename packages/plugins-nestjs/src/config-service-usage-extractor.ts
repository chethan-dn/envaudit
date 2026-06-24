import { Node, type CallExpression, type SourceFile } from 'ts-morph';
import type { VariableUsage } from '@envdoctor/contracts';
import { serializeLiteralDefaultValue } from './utils/serialize-literal-default.js';

const CONFIG_METHODS = new Set(['get', 'getOrThrow']);
const CONFIG_OBJECT_NAMES = new Set(['configService', 'config']);

export class ConfigServiceUsageExtractor {
  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[] {
    const usages: VariableUsage[] = [];

    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const callInfo = getConfigServiceCallInfo(node);
      if (callInfo) {
        usages.push(createUsage(callInfo, sourceFile, projectRootPath, node));
      }
    });

    return usages;
  }
}

interface ConfigServiceCallInfo {
  name: string;
  optional: boolean;
  defaultValue?: string;
}

function getConfigServiceCallInfo(node: CallExpression): ConfigServiceCallInfo | null {
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

  if (!Node.isStringLiteral(firstArgument) && !Node.isNoSubstitutionTemplateLiteral(firstArgument)) {
    return null;
  }

  const name = firstArgument.getLiteralText();
  const secondArgument = node.getArguments()[1];
  if (!secondArgument) {
    return { name, optional: false };
  }

  const defaultValue = serializeLiteralDefaultValue(secondArgument);

  return defaultValue === undefined
    ? { name, optional: true }
    : { name, optional: true, defaultValue };
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
  callInfo: ConfigServiceCallInfo,
  sourceFile: SourceFile,
  projectRootPath: string,
  node: CallExpression,
): VariableUsage {
  return {
    name: callInfo.name,
    sourceFile: sourceFile.getFilePath(),
    projectRootPath,
    line: node.getStartLineNumber(),
    confidence: 'high',
    usageType: 'env',
    optional: callInfo.optional,
    ...(callInfo.defaultValue !== undefined ? { defaultValue: callInfo.defaultValue } : {}),
  };
}
