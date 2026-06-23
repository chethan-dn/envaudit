import { NodeFileSystemReader } from '../workspace/filesystem/node-file-system-reader.js';
import { ProjectEnvFileDiscoverer } from './discovery/project-env-file-discoverer.js';
import { DefaultEnvDiscoveryService, type EnvDiscoveryDependencies } from './env-discovery-service.js';
import type { EnvDiscoveryService } from './interfaces/env-discovery-service.js';
import { DotenvParser } from './parser/dotenv-parser.js';

export function createDefaultEnvDiscoveryDependencies(): EnvDiscoveryDependencies {
  const fileSystem = new NodeFileSystemReader();

  return {
    fileSystem,
    envFileDiscoverer: new ProjectEnvFileDiscoverer(fileSystem),
    envFileParser: new DotenvParser(),
  };
}

export function createEnvDiscoveryService(
  deps?: Partial<EnvDiscoveryDependencies>,
): EnvDiscoveryService {
  const defaults = createDefaultEnvDiscoveryDependencies();

  return new DefaultEnvDiscoveryService({
    fileSystem: deps?.fileSystem ?? defaults.fileSystem,
    envFileDiscoverer: deps?.envFileDiscoverer ?? defaults.envFileDiscoverer,
    envFileParser: deps?.envFileParser ?? defaults.envFileParser,
  });
}
