import type { AnalysisInput } from '@envaudit/contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';
import { getRuntimeDefinitions } from '../utils/runtime-definitions.js';

export class UnusedAnalyzer implements IssueAnalyzer {
  readonly id = 'unused' as const;

  analyze(input: AnalysisInput) {
    const usageNames = new Set(input.usages.map((usage) => usage.name));
    const issues = [];

    for (const definition of getRuntimeDefinitions(input.definitions)) {
      if (definition.value === '') {
        continue;
      }

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
