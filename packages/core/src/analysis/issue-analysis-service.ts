import type { AnalysisInput, Issue } from 'envaudit-contracts';
import type { IssueAnalyzer } from './interfaces/issue-analyzer.js';
import type { IssueAnalysisService } from './interfaces/issue-analysis-service.js';
import { scopeAnalysisInput } from './utils/scope-analysis-input.js';
import { sortIssues } from './utils/sort-issues.js';

export interface IssueAnalysisDependencies {
  analyzers: IssueAnalyzer[];
}

export class DefaultIssueAnalysisService implements IssueAnalysisService {
  constructor(private readonly deps: IssueAnalysisDependencies) {}

  analyze(input: AnalysisInput): Issue[] {
    const scopedInput = scopeAnalysisInput(input);
    const issues: Issue[] = [];

    for (const analyzer of this.deps.analyzers) {
      issues.push(...analyzer.analyze(scopedInput));
    }

    return sortIssues(issues);
  }

  analyzeAll(inputs: AnalysisInput[]): Issue[] {
    const issues: Issue[] = [];

    for (const input of inputs) {
      issues.push(...this.analyze(input));
    }

    return sortIssues(issues);
  }
}
