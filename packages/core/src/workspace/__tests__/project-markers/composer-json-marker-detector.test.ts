import { describe, expect, it } from 'vitest';
import { ComposerJsonMarkerDetector } from '../../project-markers/composer-json-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('ComposerJsonMarkerDetector', () => {
  it('resolves php project from composer.json', async () => {
    const root = '/repo/web';
    const fs = new InMemoryFileSystemReader({
      [`${root}/composer.json`]: JSON.stringify({ name: 'acme/web' }),
    });
    const detector = new ComposerJsonMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'acme/web',
      rootPath: root,
      type: 'php',
      language: 'php',
    });
  });
});
