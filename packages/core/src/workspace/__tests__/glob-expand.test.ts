import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { expandWorkspaceGlobs } from '../utils/glob-expand.js';

describe('expandWorkspaceGlobs', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'envanalyser-glob-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('expands star globs to package directories', async () => {
    await mkdir(join(tempDir, 'packages', 'app'), { recursive: true });
    await mkdir(join(tempDir, 'packages', 'lib'), { recursive: true });

    const results = await expandWorkspaceGlobs(tempDir, ['packages/*']);

    expect(results).toEqual([
      resolve(tempDir, 'packages/app'),
      resolve(tempDir, 'packages/lib'),
    ]);
  });

  it('resolves literal workspace paths', async () => {
    await mkdir(join(tempDir, 'tools', 'cli'), { recursive: true });

    const results = await expandWorkspaceGlobs(tempDir, ['tools/cli']);

    expect(results).toEqual([resolve(tempDir, 'tools/cli')]);
  });

  it('ignores node_modules and dist directories', async () => {
    await mkdir(join(tempDir, 'packages', 'app'), { recursive: true });
    await mkdir(join(tempDir, 'packages', 'app', 'node_modules', 'dep'), { recursive: true });
    await mkdir(join(tempDir, 'dist'), { recursive: true });
    await mkdir(join(tempDir, 'node_modules', 'pkg'), { recursive: true });

    const results = await expandWorkspaceGlobs(tempDir, ['**/*']);

    expect(results).toContain(resolve(tempDir, 'packages'));
    expect(results).toContain(resolve(tempDir, 'packages/app'));
    expect(results).not.toContain(resolve(tempDir, 'node_modules'));
    expect(results).not.toContain(resolve(tempDir, 'dist'));
    expect(results).not.toContain(resolve(tempDir, 'packages/app/node_modules'));
  });
});
