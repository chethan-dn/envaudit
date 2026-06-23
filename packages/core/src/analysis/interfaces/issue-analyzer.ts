import type { AnalysisInput } from '@envdoctor/contracts';
import type { Issue } from '@envdoctor/contracts';

export interface IssueAnalyzer {
  readonly id: 'duplicate' | 'empty' | 'missing' | 'unused';
  analyze(input: AnalysisInput): Issue[];
}
