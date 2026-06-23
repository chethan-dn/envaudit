export interface ScanExclusionPolicy {
  getIgnorePatterns(): readonly string[];
  partition(paths: string[]): { included: string[]; excluded: string[] };
}
