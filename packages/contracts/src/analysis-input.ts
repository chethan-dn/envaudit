import type { VariableDefinition } from './variable-definition.js';
import type { VariableUsage } from './variable-usage.js';

export interface AnalysisInput {
  projectRootPath: string;
  definitions: VariableDefinition[];
  usages: VariableUsage[];
}
