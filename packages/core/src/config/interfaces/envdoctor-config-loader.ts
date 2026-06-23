export interface EnvDoctorConfigLoader {
  load(repositoryRootPath: string): Promise<import('@envdoctor/contracts').EnvDoctorConfig>;
}
