import type { ScannerPlugin } from '@envdoctor/contracts';
import { getBuiltinPlugins } from './builtins/index.js';

export interface PluginRegistry {
  getPlugins(): ScannerPlugin[];
}

export class BuiltinPluginRegistry implements PluginRegistry {
  getPlugins(): ScannerPlugin[] {
    return getBuiltinPlugins();
  }
}
