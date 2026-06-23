import { describe, expect, it } from 'vitest';
import { PyprojectMarkerDetector } from '../../project-markers/pyproject-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('PyprojectMarkerDetector', () => {
  it('resolves python project with pyproject name', async () => {
    const root = '/repo/service';
    const fs = new InMemoryFileSystemReader({
      [`${root}/pyproject.toml`]: '[project]\nname = "acme-service"\n',
    });
    const detector = new PyprojectMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'acme-service',
      rootPath: root,
      type: 'python',
      language: 'python',
    });
  });
});
