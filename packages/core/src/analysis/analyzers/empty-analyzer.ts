import type { AnalysisInput } from 'envaudit-contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';
import { getRuntimeDefinitions } from '../utils/runtime-definitions.js';

export class EmptyAnalyzer implements IssueAnalyzer {
  readonly id = 'empty' as const;

  analyze(input: AnalysisInput) {
    const issues = [];

    for (const definition of getRuntimeDefinitions(input.definitions)) {
      if (definition.value !== '') {
        continue;
      }

      issues.push({
        code: ISSUE_CODES.ENV_EMPTY,
        type: 'empty' as const,
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
