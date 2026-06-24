import type { AnalysisInput, Issue } from 'envanalyser-contracts';

export interface IssueAnalysisService {
  analyze(input: AnalysisInput): Issue[];
  analyzeAll(inputs: AnalysisInput[]): Issue[];
}
