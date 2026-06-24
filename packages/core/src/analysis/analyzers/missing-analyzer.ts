import type { AnalysisInput, VariableUsage } from '@envdoctor/contracts';
import type { Issue } from '@envdoctor/contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';
import { getRuntimeDefinitions } from '../utils/runtime-definitions.js';

export class MissingAnalyzer implements IssueAnalyzer {
  readonly id = 'missing' as const;

  analyze(input: AnalysisInput) {
    const definitionNames = new Set(
      getRuntimeDefinitions(input.definitions).map((definition) => definition.name),
    );
    const issues: Issue[] = [];

    for (const usage of input.usages) {
      if (definitionNames.has(usage.name)) {
        continue;
      }

      if (usage.optional === true) {
        issues.push(createOptionalIssue(usage));
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

function createOptionalIssue(usage: VariableUsage): Issue {
  const message =
    usage.defaultValue !== undefined
      ? `${usage.name} is used but not defined in environment files. A default value of ${usage.defaultValue} is provided in code.`
      : `${usage.name} is used but not defined in environment files. A fallback value is provided in code.`;

  return {
    code: ISSUE_CODES.ENV_OPTIONAL,
    type: 'optional',
    variable: usage.name,
    projectRootPath: usage.projectRootPath,
    sourceFile: usage.sourceFile,
    line: usage.line,
    message,
    ...(usage.defaultValue !== undefined ? { defaultValue: usage.defaultValue } : {}),
  };
}
