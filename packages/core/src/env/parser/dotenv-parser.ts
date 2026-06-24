import type { VariableDefinition } from 'envanalyser-contracts';
import type { EnvFileParser } from '../interfaces/env-file-parser.js';

export class DotenvParser implements EnvFileParser {
  parse(sourceFile: string, content: string, projectRootPath: string): VariableDefinition[] {
    const definitions: VariableDefinition[] = [];
    const lines = content.split('\n');

    for (let index = 0; index < lines.length; index += 1) {
      const parsed = parseEnvLine(lines[index]);
      if (!parsed) {
        continue;
      }

      definitions.push({
        name: parsed.name,
        value: parsed.value,
        sourceFile,
        projectRootPath,
        line: index + 1,
      });
    }

    return definitions;
  }
}

function parseEnvLine(line: string): { name: string; value: string } | null {
  let trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  if (trimmed.startsWith('export ')) {
    trimmed = trimmed.slice('export '.length).trim();
  }

  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex <= 0) {
    return null;
  }

  const name = trimmed.slice(0, equalsIndex).trim();
  if (!name) {
    return null;
  }

  const rawValue = trimmed.slice(equalsIndex + 1).trim();
  const value = stripQuotes(rawValue);

  return { name, value };
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.length >= 2 ? value.slice(1, -1) : '';
  }

  return value;
}
