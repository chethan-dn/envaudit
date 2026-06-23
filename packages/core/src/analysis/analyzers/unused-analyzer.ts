import type { AnalysisInput } from '@envdoctor/contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';

export class UnusedAnalyzer implements IssueAnalyzer {
  readonly id = 'unused' as const;

  analyze(input: AnalysisInput) {
    const usageNames = new Set(input.usages.map((usage) => usage.name));
    const issues = [];

    for (const definition of input.definitions) {
      if (usageNames.has(definition.name)) {
        continue;
      }

      issues.push({
        code: ISSUE_CODES.ENV_UNUSED,
        type: 'unused' as const,
        variable: definition.name,
        projectRootPath: definition.projectRootPath,
        sourceFile: definition.sourceFile,
        line: definition.line,
        message: `${definition.name} is defined but never used`,
      });
    }

    return issues;
  }
}
