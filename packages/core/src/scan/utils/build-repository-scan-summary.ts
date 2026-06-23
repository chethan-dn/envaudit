import type { RepositoryScanResult, ScanResult } from '@envdoctor/contracts';

export function buildRepositoryScanSummary(results: ScanResult[]): RepositoryScanResult['summary'] {
  return {
    projectCount: results.length,
    definitionCount: results.reduce((count, result) => count + result.definitions.length, 0),
    usageCount: results.reduce((count, result) => count + result.usages.length, 0),
    issueCount: results.reduce((count, result) => count + result.issues.length, 0),
  };
}
