export { SUPPORTED_SOURCE_EXTENSIONS, SUPPORTED_SOURCE_GLOB } from './constants.js';
export {
  createDefaultTypeScriptScannerDependencies,
  createTypeScriptScannerPlugin,
  TypeScriptScannerPlugin,
} from './create-typescript-scanner-plugin.js';
export type { TypeScriptScannerDependencies } from './create-typescript-scanner-plugin.js';
export { FastGlobSourceFileDiscoverer } from './discovery/source-file-discoverer.js';
export type { SourceFileDiscoverer } from './discovery/source-file-discoverer.js';
export { ProcessEnvUsageExtractor } from './scanner/process-env-usage-extractor.js';
export type { UsageExtractor } from './scanner/process-env-usage-extractor.js';
