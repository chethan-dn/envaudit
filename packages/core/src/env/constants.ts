export const ENV_FILE_NAMES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.staging',
  '.env.test',
  '.env.example',
  '.env.template',
] as const;

export const ENV_FILE_WILDCARD_PATTERN = /^\.env\.[A-Za-z0-9_-]+$/;
