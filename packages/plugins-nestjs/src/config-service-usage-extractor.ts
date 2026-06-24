import { Node, type CallExpression, type SourceFile } from 'ts-morph';
import type { VariableUsage } from 'envaudit-contracts';
import { getConfigServiceCallInfo } from './config-service-call-detection.js';
import { serializeLiteralDefaultValue } from './utils/serialize-literal-default.js';

export class ConfigServiceUsageExtractor {
  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[] {
    const usages: VariableUsage[] = [];

    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const callInfo = getConfigServiceCallInfoWithDefaults(node);
      if (callInfo) {
        usages.push(createUsage(callInfo, sourceFile, projectRootPath, node));
      }
    });

    return usages;
  }
}

function getConfigServiceCallInfoWithDefaults(node: CallExpression) {
  const callInfo = getConfigServiceCallInfo(node);
  if (!callInfo || !callInfo.optional) {
    return callInfo;
  }

  const secondArgument = node.getArguments()[1];
  if (!secondArgument) {
    return callInfo;
  }

  const defaultValue = serializeLiteralDefaultValue(secondArgument);

  return defaultValue === undefined
    ? { ...callInfo, defaultValue: undefined }
    : { ...callInfo, defaultValue };
}

function createUsage(
  callInfo: NonNullable<ReturnType<typeof getConfigServiceCallInfo>>,
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
