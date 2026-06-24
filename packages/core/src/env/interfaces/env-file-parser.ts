import type { VariableDefinition } from '@envaudit/contracts';

export interface EnvFileParser {
  parse(sourceFile: string, content: string, projectRootPath: string): VariableDefinition[];
}
