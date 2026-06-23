export interface EnvDoctorConfig {
  /** Additional glob patterns to exclude from source scanning. */
  exclude?: string[];

  /**
   * Env file basenames treated as documentation (non-runtime).
   * Merged with built-in defaults.
   */
  documentationEnvFiles?: string[];
}
