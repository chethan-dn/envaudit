import type { EnvironmentFileSummary, VariableDefinition } from 'envanalyser-contracts';

export interface EnvDiscoveryResult {
  definitions: VariableDefinition[];
  environmentFiles: EnvironmentFileSummary;
}
