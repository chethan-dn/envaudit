import type { EnvironmentFileSummary, VariableDefinition } from '@envdoctor/contracts';

export interface EnvDiscoveryResult {
  definitions: VariableDefinition[];
  environmentFiles: EnvironmentFileSummary;
}
