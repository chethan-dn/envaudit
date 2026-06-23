import type { AnalysisInput, Issue } from '@envdoctor/contracts';

export interface IssueAnalysisService {
  analyze(input: AnalysisInput): Issue[];
  analyzeAll(inputs: AnalysisInput[]): Issue[];
}
