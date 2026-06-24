import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WorkspaceRootResolver } from '../../workspace/workspace-root-resolver.js';
import { InMemoryFileSystemReader } from './in-memory-file-system.js';

describe('WorkspaceRootResolver', () => {
  it('resolves the nearest workspace root when walking up from a nested path', async () => {
    const workspaceRoot = '/repo';
    const projectRoot = '/repo/apps/service';
    const fs = new InMemoryFileSystemReader({
      [`${workspaceRoot}/pnpm-workspace.yaml`]: 'packages:\n  - apps/*\n',
    });
    const resolver = new WorkspaceRootResolver({
      fileSystem: fs,
      workspaceDetectors: [
        {
          id: 'pnpm',
          detect: async (rootPath) => fs.exists(resolve(rootPath, 'pnpm-workspace.yaml')),
          discover: async () => [],
        },
      ],
    });

    await expect(resolver.resolve(projectRoot)).resolves.toBe(workspaceRoot);
  });

  it('returns the start path when no workspace manager is found', async () => {
    const projectRoot = '/repo/apps/service';
    const fs = new InMemoryFileSystemReader();
    const resolver = new WorkspaceRootResolver({
      fileSystem: fs,
      workspaceDetectors: [
        {
          id: 'pnpm',
          detect: async () => false,
          discover: async () => [],
        },
      ],
    });

    await expect(resolver.resolve(projectRoot)).resolves.toBe(projectRoot);
  });
});
