import { Node, SyntaxKind } from 'ts-morph';

export function serializeLiteralDefaultValue(node: import('ts-morph').Node): string | undefined {
  if (Node.isNumericLiteral(node)) {
    return node.getText();
  }

  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }

  if (node.getKind() === SyntaxKind.TrueKeyword) {
    return 'true';
  }

  if (node.getKind() === SyntaxKind.FalseKeyword) {
    return 'false';
  }

  if (node.getKind() === SyntaxKind.NullKeyword) {
    return 'null';
  }

  if (Node.isIdentifier(node) && node.getText() === 'undefined') {
    return 'undefined';
  }

  return undefined;
}
