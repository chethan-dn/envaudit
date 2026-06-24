import type { AnalysisInput, Issue } from '@envaudit/contracts';

export interface IssueAnalysisService {
  analyze(input: AnalysisInput): Issue[];
  analyzeAll(inputs: AnalysisInput[]): Issue[];
}
