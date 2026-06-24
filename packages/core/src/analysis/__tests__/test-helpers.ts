import type { AnalysisInput, VariableDefinition } from 'envanalyser-contracts';

export function createAnalysisInput(
  projectRootPath: string,
  definitions: VariableDefinition[],
  usages: AnalysisInput['usages'] = [],
): AnalysisInput {
  return {
    projectRootPath,
    definitions,
    usages,
  };
}
