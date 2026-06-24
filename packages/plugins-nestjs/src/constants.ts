export const VALIDATION_SCHEMA_FILE_NAMES = [
  'env.validation.ts',
  'environment.validation.ts',
  'config.schema.ts',
] as const;

export const VALIDATION_SCHEMA_GLOBS = VALIDATION_SCHEMA_FILE_NAMES.map(
  (fileName) => `**/${fileName}`,
);

export const ENV_SCHEMA_VARIABLE_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;
