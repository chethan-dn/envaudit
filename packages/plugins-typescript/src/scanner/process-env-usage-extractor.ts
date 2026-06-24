import {
  Node,
  type ElementAccessExpression,
  type PropertyAccessExpression,
  type SourceFile,
} from 'ts-morph';
import type { VariableUsage } from '@envaudit/contracts';
import { getProcessEnvOptionalDefault } from './process-env-optional-default.js';

export interface UsageExtractor {
  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[];
}

export class ProcessEnvUsageExtractor implements UsageExtractor {
  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[] {
    const usages: VariableUsage[] = [];

    sourceFile.forEachDescendant((node) => {
      if (Node.isPropertyAccessExpression(node)) {
        const variableName = getDotAccessVariableName(node);
        if (variableName) {
          usages.push(createUsage(variableName, sourceFile, projectRootPath, node));
        }
        return;
      }

      if (Node.isElementAccessExpression(node)) {
        const variableName = getBracketAccessVariableName(node);
        if (variableName) {
          usages.push(createUsage(variableName, sourceFile, projectRootPath, node));
        }
      }
    });

    return usages;
  }
}

function getDotAccessVariableName(node: PropertyAccessExpression): string | null {
  if (!isProcessEnvExpression(node.getExpression())) {
    return null;
  }

  return node.getName();
}

function getBracketAccessVariableName(node: ElementAccessExpression): string | null {
  if (!isProcessEnvExpression(node.getExpression())) {
    return null;
  }

  const argument = node.getArgumentExpression();
  if (!argument) {
    return null;
  }

  if (Node.isStringLiteral(argument) || Node.isNoSubstitutionTemplateLiteral(argument)) {
    return argument.getLiteralText();
  }

  return null;
}

function isProcessEnvExpression(node: import('ts-morph').Node): boolean {
  if (!Node.isPropertyAccessExpression(node)) {
    return false;
  }

  const expression = node.getExpression();
  if (!Node.isIdentifier(expression) || expression.getText() !== 'process') {
    return false;
  }

  return node.getName() === 'env';
}

function createUsage(
  name: string,
  sourceFile: SourceFile,
  projectRootPath: string,
  node: PropertyAccessExpression | ElementAccessExpression,
): VariableUsage {
  const optionalInfo = getProcessEnvOptionalDefault(node);

  return {
    name,
    sourceFile: sourceFile.getFilePath(),
    projectRootPath,
    line: node.getStartLineNumber(),
    confidence: 'high',
    usageType: 'env',
    optional: optionalInfo.optional,
    ...(optionalInfo.defaultValue !== undefined ? { defaultValue: optionalInfo.defaultValue } : {}),
  };
}
