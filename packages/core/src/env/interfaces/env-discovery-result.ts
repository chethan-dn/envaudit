import type { EnvironmentFileSummary, VariableDefinition } from '@envaudit/contracts';

export interface EnvDiscoveryResult {
  definitions: VariableDefinition[];
  environmentFiles: EnvironmentFileSummary;
}
