import { describe, expect, it } from 'vitest';
import { GradleMarkerDetector } from '../../project-markers/gradle-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('GradleMarkerDetector', () => {
  it('resolves java project from build.gradle', async () => {
    const root = '/repo/backend';
    const fs = new InMemoryFileSystemReader({
      [`${root}/build.gradle`]: "plugins { id 'java' }",
    });
    const detector = new GradleMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'backend',
      rootPath: root,
      type: 'java',
      language: 'java',
    });
  });

  it('detects build.gradle.kts', async () => {
    const root = '/repo/backend';
    const fs = new InMemoryFileSystemReader({
      [`${root}/build.gradle.kts`]: 'plugins { java }',
    });
    const detector = new GradleMarkerDetector(fs);

    expect(await detector.detect(root)).toBe(true);
  });
});
