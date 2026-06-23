import type { ScanResult } from './scan-result.js';

export interface RepositoryScanSummary {
  projectCount: number;
  definitionCount: number;
  usageCount: number;
  issueCount: number;
}

export interface RepositoryScanResult {
  rootPath: string;
  results: ScanResult[];
  summary: RepositoryScanSummary;
}
