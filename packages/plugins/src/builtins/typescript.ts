import type { ScanExclusionPolicy } from 'envanalyser-contracts';
import { createTypeScriptScannerPlugin } from 'envanalyser-plugins-typescript';

export function getBuiltinPlugins(exclusionPolicy: ScanExclusionPolicy) {
  return [createTypeScriptScannerPlugin({ exclusionPolicy })];
}
