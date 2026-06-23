import type { Issue, VariableDefinition } from '@envdoctor/contracts';
import type { IssueAnalyzer } from './interfaces/issue-analyzer.js';
import type { IssueAnalysisService } from './interfaces/issue-analysis-service.js';
import { groupDefinitionsByProject } from './utils/group-by-project.js';
import { sortIssues } from './utils/sort-issues.js';

export interface IssueAnalysisDependencies {
  analyzers: IssueAnalyzer[];
}

export class DefaultIssueAnalysisService implements IssueAnalysisService {
  constructor(private readonly deps: IssueAnalysisDependencies) {}

  analyze(definitions: VariableDefinition[]): Issue[] {
    const issues: Issue[] = [];
    const projectGroups = groupDefinitionsByProject(definitions);

    for (const projectDefinitions of projectGroups.values()) {
      for (const analyzer of this.deps.analyzers) {
        issues.push(...analyzer.analyze(projectDefinitions));
      }
    }

    return sortIssues(issues);
  }
}
