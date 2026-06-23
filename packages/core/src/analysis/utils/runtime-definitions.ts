import type { VariableDefinition } from '@envdoctor/contracts';

export function getRuntimeDefinitions(definitions: VariableDefinition[]): VariableDefinition[] {
  return definitions.filter((definition) => isRuntimeDefinition(definition));
}

export function isRuntimeDefinition(definition: VariableDefinition): boolean {
  return definition.sourceKind !== 'documentation';
}
