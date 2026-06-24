import type { AnalysisInput } from 'envanalyser-contracts';
import type { Issue } from 'envanalyser-contracts';

export interface IssueAnalyzer {
  readonly id: 'duplicate' | 'empty' | 'missing' | 'unused';
  analyze(input: AnalysisInput): Issue[];
}
