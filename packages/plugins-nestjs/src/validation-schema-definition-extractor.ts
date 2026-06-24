import type { SourceFile } from 'ts-morph';
import type { VariableDefinition } from 'envaudit-contracts';
import { ENV_SCHEMA_VARIABLE_NAME_PATTERN } from './constants.js';
import { serializeLiteralDefaultValue } from './utils/serialize-literal-default.js';

export class ValidationSchemaDefinitionExtractor {
  extract(sourceFile: SourceFile, projectRootPath: string): VariableDefinition[] {
    const definitions: VariableDefinition[] = [];

    for (const classDeclaration of sourceFile.getClasses()) {
      for (const property of classDeclaration.getProperties()) {
        const name = property.getName();
        if (!ENV_SCHEMA_VARIABLE_NAME_PATTERN.test(name)) {
          continue;
        }

        const initializer = property.getInitializer();
        const defaultValue = initializer ? serializeLiteralDefaultValue(initializer) : undefined;

        definitions.push({
          name,
          value: defaultValue,
          sourceFile: sourceFile.getFilePath(),
          projectRootPath,
          line: property.getStartLineNumber(),
          definitionSource: 'validation-schema',
          schemaOptional: property.hasQuestionToken(),
        });
      }
    }

    return definitions;
  }
}

export function isEnvSchemaVariableName(name: string): boolean {
  return ENV_SCHEMA_VARIABLE_NAME_PATTERN.test(name);
}
