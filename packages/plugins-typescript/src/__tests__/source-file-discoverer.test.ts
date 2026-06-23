import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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

    const discoverer = new FastGlobSourceFileDiscoverer();
    const files = await discoverer.discover(tempDir);

    expect(files).toEqual([join(tempDir, 'src', 'app.ts')]);
  });
});
