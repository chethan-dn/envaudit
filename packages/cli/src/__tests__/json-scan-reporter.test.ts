import { describe, expect, it } from 'vitest';
import { JsonScanReporter } from '../reporters/json-scan-reporter.js';
import { sampleRepositoryScanResult } from './fixtures/repository-scan-result.fixture.js';

describe('JsonScanReporter', () => {
  const reporter = new JsonScanReporter();

  it('serializes RepositoryScanResult directly', () => {
    const output = reporter.render(sampleRepositoryScanResult);

    expect(JSON.parse(output)).toEqual(sampleRepositoryScanResult);
  });

  it('ends output with a newline', () => {
    const output = reporter.render(sampleRepositoryScanResult);

    expect(output.endsWith('\n')).toBe(true);
  });
});
