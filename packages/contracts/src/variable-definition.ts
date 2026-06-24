import type { DefinitionSource } from './definition-source.js';
import type { EnvFileKind } from './env-file-kind.js';

export interface VariableDefinition {
  name: string;
  value?: string;
  sourceFile: string;
  projectRootPath: string;
  line?: number;
  sourceKind?: EnvFileKind;
  definitionSource?: DefinitionSource;
  schemaOptional?: boolean;
}
