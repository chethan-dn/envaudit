import type { AnalysisInput } from '@envdoctor/contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';

export class MissingAnalyzer implements IssueAnalyzer {
  readonly id = 'missing' as const;

  analyze(input: AnalysisInput) {
    const definitionNames = new Set(input.definitions.map((definition) => definition.name));
    const issues = [];

    for (const usage of input.usages) {
      if (definitionNames.has(usage.name)) {
        continue;
      }

      issues.push({
        code: ISSUE_CODES.ENV_MISSING,
        type: 'missing' as const,
        variable: usage.name,
        projectRootPath: usage.projectRootPath,
        sourceFile: usage.sourceFile,
        line: usage.line,
        message: `${usage.name} is used but not defined in environment files`,
      });
    }

    return issues;
  }
}
