import type { VariableDefinition } from 'envanalyser-contracts';
import { isValidationSchemaDefinition } from './validation-schema-definitions.js';

export function getRuntimeDefinitions(definitions: VariableDefinition[]): VariableDefinition[] {
  return definitions.filter((definition) => isRuntimeDefinition(definition));
}

export function isRuntimeDefinition(definition: VariableDefinition): boolean {
  if (isValidationSchemaDefinition(definition)) {
    return false;
  }

  return definition.sourceKind !== 'documentation';
}
