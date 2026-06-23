import type { VariableDefinition } from '@envdoctor/contracts';

export interface EnvFileParser {
  parse(sourceFile: string, content: string, projectRootPath: string): VariableDefinition[];
}
