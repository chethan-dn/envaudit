import type { Issue } from 'envaudit-contracts';

export function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const typeCompare = a.type.localeCompare(b.type);
    if (typeCompare !== 0) {
      return typeCompare;
    }

    const variableCompare = a.variable.localeCompare(b.variable);
    if (variableCompare !== 0) {
      return variableCompare;
    }

    const sourceFileCompare = (a.sourceFile ?? '').localeCompare(b.sourceFile ?? '');
    if (sourceFileCompare !== 0) {
      return sourceFileCompare;
    }

    return (a.line ?? 0) - (b.line ?? 0);
  });
}
