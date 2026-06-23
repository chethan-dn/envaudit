export { ENV_FILE_NAMES, ENV_FILE_WILDCARD_PATTERN } from './constants.js';
export { createDefaultEnvDiscoveryDependencies, createEnvDiscoveryService } from './create-env-discovery-service.js';
export type { EnvDiscoveryDependencies } from './env-discovery-service.js';
export { DefaultEnvDiscoveryService } from './env-discovery-service.js';
export { compareEnvFiles, isEnvFile } from './discovery/env-file-matcher.js';
export {
  ProjectDirectoryNotFoundError,
  ProjectEnvFileDiscoverer,
} from './discovery/project-env-file-discoverer.js';
export type { EnvDiscoveryService } from './interfaces/env-discovery-service.js';
export type { EnvFileDiscoverer } from './interfaces/env-file-discoverer.js';
export type { EnvFileParser } from './interfaces/env-file-parser.js';
export { DotenvParser } from './parser/dotenv-parser.js';
