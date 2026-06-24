import type { ScanExclusionPolicy, ScannerPlugin } from 'envanalyser-contracts';
import { getBuiltinPlugins } from './builtins/index.js';

export interface PluginRegistry {
  getPlugins(exclusionPolicy: ScanExclusionPolicy): ScannerPlugin[];
}

export class BuiltinPluginRegistry implements PluginRegistry {
  getPlugins(exclusionPolicy: ScanExclusionPolicy): ScannerPlugin[] {
    return getBuiltinPlugins(exclusionPolicy);
  }
}
