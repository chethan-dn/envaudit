import type { AnalysisInput, VariableDefinition, VariableUsage } from 'envaudit-contracts';
import type { Issue } from 'envaudit-contracts';
import { ISSUE_CODES } from '../constants.js';
import type { IssueAnalyzer } from '../interfaces/issue-analyzer.js';
import { getRuntimeDefinitions } from '../utils/runtime-definitions.js';
import { getValidationSchemaDefinitions } from '../utils/validation-schema-definitions.js';

export class MissingAnalyzer implements IssueAnalyzer {
  readonly id = 'missing' as const;

  analyze(input: AnalysisInput) {
    const runtimeDefinitionNames = new Set(
      getRuntimeDefinitions(input.definitions).map((definition) => definition.name),
    );
    const schemaDefinitionsByName = new Map(
      getValidationSchemaDefinitions(input.definitions).map((definition) => [
        definition.name,
        definition,
      ]),
    );
    const issues: Issue[] = [];

    for (const usage of input.usages) {
      if (runtimeDefinitionNames.has(usage.name)) {
        continue;
      }

      if (usage.optional === true) {
        issues.push(createOptionalIssue(usage));
        continue;
      }

      const schemaDefinition = schemaDefinitionsByName.get(usage.name);
      if (schemaDefinition) {
        issues.push(createUnconfiguredIssue(usage, schemaDefinition, input.runtimeEnvFiles ?? []));
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

function createUnconfiguredIssue(
  usage: VariableUsage,
  schemaDefinition: VariableDefinition,
  runtimeEnvFiles: string[],
): Issue {
  return {
    code: ISSUE_CODES.ENV_UNCONFIGURED,
    type: 'unconfigured',
    variable: usage.name,
    projectRootPath: usage.projectRootPath,
    sourceFile: schemaDefinition.sourceFile,
    line: schemaDefinition.line,
    schemaFile: schemaDefinition.sourceFile,
    runtimeEnvFiles,
    message: `${usage.name} is declared in the application configuration schema but is not configured in runtime environment files.`,
  };
}
