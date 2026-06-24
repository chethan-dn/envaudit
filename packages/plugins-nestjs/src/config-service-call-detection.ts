import { Node, type CallExpression } from 'ts-morph';

export const CONFIG_METHODS = new Set(['get', 'getOrThrow']);
export const CONFIG_OBJECT_NAMES = new Set(['configService', 'config']);

export interface ConfigServiceCallInfo {
  name: string;
  optional: boolean;
  defaultValue?: string;
}

export function getConfigServiceCallInfo(node: CallExpression): ConfigServiceCallInfo | null {
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

  return { name, optional: true };
}

export function isConfigServiceReceiver(node: import('ts-morph').Node): boolean {
  if (Node.isIdentifier(node)) {
    return CONFIG_OBJECT_NAMES.has(node.getText());
  }

  if (Node.isPropertyAccessExpression(node)) {
    return Node.isThisExpression(node.getExpression()) && CONFIG_OBJECT_NAMES.has(node.getName());
  }

  return false;
}

export function isPartOfConfigServiceCall(node: import('ts-morph').Node): boolean {
  const parent = node.getParent();
  if (!Node.isPropertyAccessExpression(node) || !Node.isPropertyAccessExpression(parent)) {
    return false;
  }

  return parent.getExpression() === node && CONFIG_METHODS.has(parent.getName());
}
