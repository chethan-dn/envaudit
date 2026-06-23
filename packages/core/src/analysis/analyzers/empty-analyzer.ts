import type { Issue, VariableDefinition } from '@envdoctor/contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';

export class EmptyAnalyzer implements IssueAnalyzer {
  readonly id = 'empty' as const;

  analyze(definitions: VariableDefinition[]): Issue[] {
    const issues: Issue[] = [];

    for (const definition of definitions) {
      if (definition.value !== '') {
        continue;
      }

      issues.push({
        code: ISSUE_CODES.ENV_EMPTY,
        type: 'empty',
        variable: definition.name,
        projectRootPath: definition.projectRootPath,
        sourceFile: definition.sourceFile,
        line: definition.line,
        message: `${definition.name} has an empty value`,
      });
    }

    return issues;
  }
}
