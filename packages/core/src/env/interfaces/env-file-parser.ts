import type { VariableDefinition } from 'envanalyser-contracts';

export interface EnvFileParser {
  parse(sourceFile: string, content: string, projectRootPath: string): VariableDefinition[];
}
