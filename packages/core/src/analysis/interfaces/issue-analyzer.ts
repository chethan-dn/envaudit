import type { AnalysisInput } from '@envaudit/contracts';
import type { Issue } from '@envaudit/contracts';

export interface IssueAnalyzer {
  readonly id: 'duplicate' | 'empty' | 'missing' | 'unused';
  analyze(input: AnalysisInput): Issue[];
}
