import { DuplicateAnalyzer } from './analyzers/duplicate-analyzer.js';
import { EmptyAnalyzer } from './analyzers/empty-analyzer.js';
import { MissingAnalyzer } from './analyzers/missing-analyzer.js';
import { UnusedAnalyzer } from './analyzers/unused-analyzer.js';
import { DefaultIssueAnalysisService, type IssueAnalysisDependencies } from './issue-analysis-service.js';
import type { IssueAnalysisService } from './interfaces/issue-analysis-service.js';

export function createDefaultIssueAnalysisDependencies(): IssueAnalysisDependencies {
  return {
    analyzers: [
      new DuplicateAnalyzer(),
      new EmptyAnalyzer(),
      new MissingAnalyzer(),
      new UnusedAnalyzer(),
    ],
  };
}

export function createIssueAnalysisService(
  deps?: Partial<IssueAnalysisDependencies>,
): IssueAnalysisService {
  const defaults = createDefaultIssueAnalysisDependencies();

  return new DefaultIssueAnalysisService({
    analyzers: deps?.analyzers ?? defaults.analyzers,
  });
}
