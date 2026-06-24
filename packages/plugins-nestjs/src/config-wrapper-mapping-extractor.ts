import { Node, type GetAccessorDeclaration, type SourceFile } from 'ts-morph';
import { getConfigServiceCallInfo } from './config-service-call-detection.js';
import { serializeLiteralDefaultValue } from './utils/serialize-literal-default.js';

export interface ConfigWrapperMapping {
  propertyName: string;
  variable: string;
  sourceFile: string;
  line: number;
  optional: boolean;
  defaultValue?: string;
}

export class ConfigWrapperMappingExtractor {
  extract(sourceFile: SourceFile): ConfigWrapperMapping[] {
    const mappings: ConfigWrapperMapping[] = [];

    for (const classDeclaration of sourceFile.getClasses()) {
      for (const getter of classDeclaration.getGetAccessors()) {
        const mapping = extractGetterMapping(getter, sourceFile);
        if (mapping) {
          mappings.push(mapping);
        }
      }
    }

    return mappings;
  }
}

function extractGetterMapping(
  getter: GetAccessorDeclaration,
  sourceFile: SourceFile,
): ConfigWrapperMapping | null {
  const body = getter.getBody();
  if (!body || !Node.isBlock(body)) {
    return null;
  }

  const statements = body.getStatements();
  if (statements.length !== 1 || !Node.isReturnStatement(statements[0])) {
    return null;
  }

  const returnExpression = statements[0].getExpression();
  if (!returnExpression || !Node.isCallExpression(returnExpression)) {
    return null;
  }

  const callInfo = getConfigServiceCallInfo(returnExpression);
  if (!callInfo) {
    return null;
  }

  let defaultValue = callInfo.defaultValue;
  if (callInfo.optional) {
    const secondArgument = returnExpression.getArguments()[1];
    defaultValue = secondArgument ? serializeLiteralDefaultValue(secondArgument) : undefined;
  }

  return {
    propertyName: getter.getName(),
    variable: callInfo.name,
    sourceFile: sourceFile.getFilePath(),
    line: getter.getStartLineNumber(),
    optional: callInfo.optional,
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  };
}

export function collectConfigWrapperMappings(
  sourceFiles: SourceFile[],
  extractor: ConfigWrapperMappingExtractor = new ConfigWrapperMappingExtractor(),
): Map<string, ConfigWrapperMapping> {
  const mappings = new Map<string, ConfigWrapperMapping>();

  for (const sourceFile of sourceFiles) {
    for (const mapping of extractor.extract(sourceFile)) {
      mappings.set(mapping.propertyName, mapping);
    }
  }

  return mappings;
}
