import { describe, expect, it } from 'vitest';
import { RequirementsTxtMarkerDetector } from '../../project-markers/requirements-txt-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('RequirementsTxtMarkerDetector', () => {
  it('resolves python project from requirements.txt', async () => {
    const root = '/repo/service';
    const fs = new InMemoryFileSystemReader({
      [`${root}/requirements.txt`]: 'requests\n',
    });
    const detector = new RequirementsTxtMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'service',
      rootPath: root,
      type: 'python',
      language: 'python',
    });
  });
});
