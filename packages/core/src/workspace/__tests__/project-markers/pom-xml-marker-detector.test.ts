import { describe, expect, it } from 'vitest';
import { PomXmlMarkerDetector } from '../../project-markers/pom-xml-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('PomXmlMarkerDetector', () => {
  it('resolves java project from pom.xml', async () => {
    const root = '/repo/backend';
    const fs = new InMemoryFileSystemReader({
      [`${root}/pom.xml`]: '<project></project>',
    });
    const detector = new PomXmlMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'backend',
      rootPath: root,
      type: 'java',
      language: 'java',
    });
  });
});
