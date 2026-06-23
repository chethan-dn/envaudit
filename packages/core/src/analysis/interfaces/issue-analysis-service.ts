import type { Issue, VariableDefinition } from '@envdoctor/contracts';

export interface IssueAnalysisService {
  analyze(definitions: VariableDefinition[]): Issue[];
}
