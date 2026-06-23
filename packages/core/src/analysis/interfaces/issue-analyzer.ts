import type { VariableDefinition } from '@envdoctor/contracts';
import type { Issue } from '@envdoctor/contracts';

export interface IssueAnalyzer {
  readonly id: 'duplicate' | 'empty';
  analyze(definitions: VariableDefinition[]): Issue[];
}
