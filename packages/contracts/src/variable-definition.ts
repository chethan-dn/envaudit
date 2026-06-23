export interface VariableDefinition {
  name: string;
  value?: string;
  sourceFile: string;
  projectRootPath: string;
  line?: number;
}
