import type { ScanExclusionPolicy, ScannerPlugin } from '@envaudit/contracts';
import { getBuiltinPlugins } from './builtins/index.js';

export interface PluginRegistry {
  getPlugins(exclusionPolicy: ScanExclusionPolicy): ScannerPlugin[];
}

export class BuiltinPluginRegistry implements PluginRegistry {
  getPlugins(exclusionPolicy: ScanExclusionPolicy): ScannerPlugin[] {
    return getBuiltinPlugins(exclusionPolicy);
  }
}
