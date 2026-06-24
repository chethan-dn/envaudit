import type { VariableDefinition } from '@envdoctor/contracts';

export function getValidationSchemaDefinitions(
  definitions: VariableDefinition[],
): VariableDefinition[] {
  return definitions.filter((definition) => isValidationSchemaDefinition(definition));
}

export function isValidationSchemaDefinition(definition: VariableDefinition): boolean {
  return definition.definitionSource === 'validation-schema';
}
