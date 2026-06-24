export interface EnvAuditConfigLoader {
  load(repositoryRootPath: string): Promise<import('envaudit-contracts').EnvAuditConfig>;
}
