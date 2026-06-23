import { describe, expect, it } from 'vitest';
import { DEFAULT_TEST_FILE_EXCLUDES } from '../default-scan-excludes.js';
import { createScanExclusionPolicy } from '../create-scan-exclusion-policy.js';

describe('createScanExclusionPolicy', () => {
  it('includes built-in test file exclusions for supported source types', () => {
    const policy = createScanExclusionPolicy();

    expect(policy.getIgnorePatterns()).toEqual(
      expect.arrayContaining([...DEFAULT_TEST_FILE_EXCLUDES]),
    );
  });

  it('merges user excludes from config', () => {
    const policy = createScanExclusionPolicy({
      exclude: ['legacy/**'],
    });

    expect(policy.getIgnorePatterns()).toContain('legacy/**');
  });

  it('partitions excluded and included paths', () => {
    const policy = createScanExclusionPolicy();

    const outcome = policy.partition([
      'src/app.ts',
      'src/app.test.ts',
      'src/app.spec.tsx',
      'dist/out.js',
      'coverage/lcov.info',
    ]);

    expect(outcome.included).toEqual(['src/app.ts']);
    expect(outcome.excluded).toEqual([
      'src/app.test.ts',
      'src/app.spec.tsx',
      'dist/out.js',
      'coverage/lcov.info',
    ]);
  });
});
