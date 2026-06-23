import type { VariableDefinition } from '@envdoctor/contracts';

export function groupDefinitionsByProject(
  definitions: VariableDefinition[],
): Map<string, VariableDefinition[]> {
  const groups = new Map<string, VariableDefinition[]>();

  for (const definition of definitions) {
    const existing = groups.get(definition.projectRootPath) ?? [];
    existing.push(definition);
    groups.set(definition.projectRootPath, existing);
  }

  return groups;
}
