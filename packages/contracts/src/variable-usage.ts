export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type UsageType = 'env';

export interface VariableUsage {
  name: string;
  sourceFile: string;
  projectRootPath: string;
  line?: number;
  confidence: ConfidenceLevel;
  usageType: UsageType;
}
