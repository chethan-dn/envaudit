import type { AnalysisInput } from 'envaudit-contracts';

export function scopeAnalysisInput(input: AnalysisInput): AnalysisInput {
  return {
    projectRootPath: input.projectRootPath,
    definitions: input.definitions.filter(
      (definition) => definition.projectRootPath === input.projectRootPath,
    ),
    usages: input.usages.filter((usage) => usage.projectRootPath === input.projectRootPath),
  };
}
