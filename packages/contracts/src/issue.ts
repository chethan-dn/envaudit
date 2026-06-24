export type IssueType =
  | 'missing'
  | 'empty'
  | 'duplicate'
  | 'unused'
  | 'drift'
  | 'optional'
  | 'unconfigured';

export interface Issue {
  code: string;
  type: IssueType;
  variable: string;
  projectRootPath: string;
  sourceFile?: string;
  line?: number;
  message?: string;
  defaultValue?: string;
  schemaFile?: string;
  runtimeEnvFiles?: string[];
}
