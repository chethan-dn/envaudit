import { describe, expect, it } from 'vitest';
import { HumanScanReporter } from '../reporters/human-scan-reporter.js';
import {
  cleanRepositoryScanResult,
  monorepoRepositoryScanResult,
  sampleRepositoryScanResult,
} from './fixtures/repository-scan-result.fixture.js';

describe('HumanScanReporter', () => {
  const reporter = new HumanScanReporter();

  it('renders repository summary and per-project sections', () => {
    const output = reporter.render(sampleRepositoryScanResult);

    expect(output).toContain('Repository: /repo');
    expect(output).toContain('Summary');
    expect(output).toContain('  Projects:    1');
    expect(output).toContain('  Definitions: 2');
    expect(output).toContain('  Usages:      1');
    expect(output).toContain('  Issues:      2');
    expect(output).toContain('  Scanned:     3');
    expect(output).toContain('  Skipped:     1');
    expect(output).toContain('── api (/repo/apps/api) ──');
    expect(output).toContain('Definitions: 2');
    expect(output).toContain('Usages:      1');
    expect(output).toContain('Issues:      2');
    expect(output).toContain('Scanned:     3');
    expect(output).toContain('Skipped:     1');
    expect(output).toContain('  ENV_MISSING (1)');
    expect(output).toContain('    MISSING_KEY');
    expect(output).toContain('      src/index.ts:4');
    expect(output).toContain('  ENV_UNUSED (1)');
    expect(output).toContain('    UNUSED_KEY');
    expect(output).toContain('      .env:2');
  });

  it('renders a no-issues message for clean projects', () => {
    const output = reporter.render(cleanRepositoryScanResult);

    expect(output).toContain('Issues:      0');
    expect(output).toContain('  No issues found.');
  });

  it('renders multiple project sections for monorepos', () => {
    const output = reporter.render(monorepoRepositoryScanResult);

    expect(output).toContain('── web (/repo/monorepo/apps/web) ──');
    expect(output).toContain('── api (/repo/monorepo/apps/api) ──');
    expect(output).toContain('  Projects:    2');
  });
});
