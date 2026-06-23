import { describe, expect, it } from 'vitest';
import { GoModMarkerDetector } from '../../project-markers/go-mod-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('GoModMarkerDetector', () => {
  it('resolves go project from go.mod', async () => {
    const root = '/repo/api';
    const fs = new InMemoryFileSystemReader({
      [`${root}/go.mod`]: 'module example.com/api\n',
    });
    const detector = new GoModMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'api',
      rootPath: root,
      type: 'go',
      language: 'go',
    });
  });
});
