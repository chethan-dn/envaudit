import type { ScannerPlugin } from '@envdoctor/contracts';
import { createTypeScriptScannerPlugin } from '@envdoctor/plugins-typescript';

export function getBuiltinPlugins(): ScannerPlugin[] {
  return [createTypeScriptScannerPlugin()];
}
