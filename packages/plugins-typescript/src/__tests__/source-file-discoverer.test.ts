import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createScanExclusionPolicy } from '@envdoctor/contracts';
import { FastGlobSourceFileDiscoverer } from '../discovery/source-file-discoverer.js';

describe('FastGlobSourceFileDiscoverer', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envdoctor-ts-plugin-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('discovers supported source files and ignores node_modules', async () => {
    await mkdir(join(tempDir, 'src'), { recursive: true });
    await mkdir(join(tempDir, 'node_modules', 'pkg'), { recursive: true });
    await writeFile(join(tempDir, 'src', 'app.ts'), 'export {}');
    await writeFile(join(tempDir, 'node_modules', 'pkg', 'index.ts'), 'process.env.PORT');

    const discoverer = new FastGlobSourceFileDiscoverer(createScanExclusionPolicy());
    const outcome = await discoverer.discover(tempDir);

    expect(outcome.scannedFiles).toEqual([join(tempDir, 'src', 'app.ts')]);
    expect(outcome.skippedFiles).toEqual([]);
  });

  it('skips built-in test file patterns', async () => {
    await mkdir(join(tempDir, 'src'), { recursive: true });
    await writeFile(join(tempDir, 'src', 'app.ts'), 'export {}');
    await writeFile(join(tempDir, 'src', 'app.test.ts'), 'process.env.PORT');
    await writeFile(join(tempDir, 'src', 'app.spec.tsx'), 'process.env.PORT');

    const discoverer = new FastGlobSourceFileDiscoverer(createScanExclusionPolicy());
    const outcome = await discoverer.discover(tempDir);

    expect(outcome.scannedFiles).toEqual([join(tempDir, 'src', 'app.ts')]);
    expect(outcome.skippedFiles.sort()).toEqual(
      [join(tempDir, 'src', 'app.test.ts'), join(tempDir, 'src', 'app.spec.tsx')].sort(),
    );
  });
});
