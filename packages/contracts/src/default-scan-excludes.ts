import { DEFAULT_IGNORED_DIRECTORIES } from './default-ignored-directories.js';

export const DEFAULT_TEST_FILE_EXCLUDES = [
  '**/*.spec.ts',
  '**/*.test.ts',
  '**/*.spec.tsx',
  '**/*.test.tsx',
  '**/*.spec.js',
  '**/*.test.js',
  '**/*.spec.jsx',
  '**/*.test.jsx',
] as const;

export const DEFAULT_BUILD_OUTPUT_EXCLUDES = ['dist/**', 'coverage/**'] as const;

const DIRECTORY_EXCLUDES = DEFAULT_IGNORED_DIRECTORIES.map((dir) => `**/${dir}/**`);

export const DEFAULT_SCAN_EXCLUDES = [
  ...DEFAULT_TEST_FILE_EXCLUDES,
  ...DEFAULT_BUILD_OUTPUT_EXCLUDES,
  ...DIRECTORY_EXCLUDES,
] as const;
