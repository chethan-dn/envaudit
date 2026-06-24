import type { SourceFile } from 'ts-morph';
import type { VariableUsage } from '@envaudit/contracts';
import type { UsageExtractor } from './process-env-usage-extractor.js';

export class CompositeUsageExtractor implements UsageExtractor {
  constructor(private readonly extractors: UsageExtractor[]) {}

  extract(sourceFile: SourceFile, projectRootPath: string): VariableUsage[] {
    const usages: VariableUsage[] = [];

    for (const extractor of this.extractors) {
      usages.push(...extractor.extract(sourceFile, projectRootPath));
    }

    return usages;
  }
}
