import type { VariableUsage } from './variable-usage.js';

export interface ScannerPlugin {
  id: string;
  name: string;
  detect(rootPath: string): Promise<boolean>;
  scan(rootPath: string): Promise<VariableUsage[]>;
}
