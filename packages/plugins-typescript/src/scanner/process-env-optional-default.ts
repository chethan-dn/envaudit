import { Node, SyntaxKind, type BinaryExpression, type ElementAccessExpression, type PropertyAccessExpression } from 'ts-morph';
import { serializeLiteralDefaultValue } from './serialize-literal-default.js';

export function getProcessEnvOptionalDefault(
  node: PropertyAccessExpression | ElementAccessExpression,
): { optional: boolean; defaultValue?: string } {
  const parent = node.getParent();
  if (!Node.isBinaryExpression(parent)) {
    return { optional: false };
  }

  if (!isNullishOrLogicalOrFallback(parent)) {
    return { optional: false };
  }

  if (parent.getLeft() !== node) {
    return { optional: false };
  }

  const defaultValue = serializeLiteralDefaultValue(parent.getRight());

  return defaultValue === undefined
    ? { optional: true }
    : { optional: true, defaultValue };
}

function isNullishOrLogicalOrFallback(expression: BinaryExpression): boolean {
  const operator = expression.getOperatorToken().getKind();
  return operator === SyntaxKind.QuestionQuestionToken || operator === SyntaxKind.BarBarToken;
}
