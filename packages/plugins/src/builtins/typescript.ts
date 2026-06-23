import type { ScanExclusionPolicy } from '@envdoctor/contracts';
import { createTypeScriptScannerPlugin } from '@envdoctor/plugins-typescript';

export function getBuiltinPlugins(exclusionPolicy: ScanExclusionPolicy) {
  return [createTypeScriptScannerPlugin({ exclusionPolicy })];
}
