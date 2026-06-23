export type IssueType = 'missing' | 'empty' | 'duplicate' | 'unused' | 'drift';

export interface Issue {
  type: IssueType;
  variable: string;
  file?: string;
  message?: string;
}
