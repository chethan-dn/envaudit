export interface EnvAnalyserConfigLoader {
  load(repositoryRootPath: string): Promise<import('envanalyser-contracts').EnvAnalyserConfig>;
}
