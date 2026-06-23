import type { Issue, VariableDefinition } from '@envdoctor/contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';

export class DuplicateAnalyzer implements IssueAnalyzer {
  readonly id = 'duplicate' as const;

  analyze(definitions: VariableDefinition[]): Issue[] {
    const issues: Issue[] = [];
    const bySourceFile = groupBySourceFile(definitions);

    for (const [sourceFile, fileDefinitions] of bySourceFile) {
      const byName = groupByName(fileDefinitions);

      for (const [variable, variableDefinitions] of byName) {
        if (variableDefinitions.length <= 1) {
          continue;
        }

        const sorted = [...variableDefinitions].sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
        const canonical = sorted[0];

        for (const definition of sorted.slice(1)) {
          issues.push({
            code: ISSUE_CODES.ENV_DUPLICATE,
            type: 'duplicate',
            variable,
            projectRootPath: definition.projectRootPath,
            sourceFile,
            line: definition.line,
            message: `${variable} is also defined in ${sourceFile}:${canonical.line ?? '?'}`,
          });
        }
      }
    }

    return issues;
  }
}

function groupBySourceFile(
  definitions: VariableDefinition[],
): Map<string, VariableDefinition[]> {
  const groups = new Map<string, VariableDefinition[]>();

  for (const definition of definitions) {
    const existing = groups.get(definition.sourceFile) ?? [];
    existing.push(definition);
    groups.set(definition.sourceFile, existing);
  }

  return groups;
}

function groupByName(definitions: VariableDefinition[]): Map<string, VariableDefinition[]> {
  const groups = new Map<string, VariableDefinition[]>();

  for (const definition of definitions) {
    const existing = groups.get(definition.name) ?? [];
    existing.push(definition);
    groups.set(definition.name, existing);
  }

  return groups;
}
