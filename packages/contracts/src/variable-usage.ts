export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface VariableUsage {
  name: string;
  file: string;
  line?: number;
  confidence: ConfidenceLevel;
}
