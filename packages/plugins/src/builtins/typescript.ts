import type { ScanExclusionPolicy } from '@envaudit/contracts';
import { createTypeScriptScannerPlugin } from '@envaudit/plugins-typescript';

export function getBuiltinPlugins(exclusionPolicy: ScanExclusionPolicy) {
  return [createTypeScriptScannerPlugin({ exclusionPolicy })];
}
