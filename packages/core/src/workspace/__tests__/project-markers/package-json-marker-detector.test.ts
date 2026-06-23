import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PackageJsonMarkerDetector } from '../../project-markers/package-json-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('PackageJsonMarkerDetector', () => {
  const root = '/repo/packages/app';

  it('detects typescript when tsconfig.json is present', async () => {
    const fs = new InMemoryFileSystemReader({
      [`${root}/package.json`]: JSON.stringify({ name: '@acme/app' }),
      [`${root}/tsconfig.json`]: '{}',
    });
    const detector = new PackageJsonMarkerDetector(fs);

    expect(await detector.detect(root)).toBe(true);
    await expect(detector.resolve(root)).resolves.toEqual({
      name: '@acme/app',
      rootPath: root,
      type: 'node',
      language: 'typescript',
    });
  });

  it('detects javascript when only package.json is present', async () => {
    const fs = new InMemoryFileSystemReader({
      [`${root}/package.json`]: JSON.stringify({ name: '@acme/app' }),
    });
    const detector = new PackageJsonMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: '@acme/app',
      rootPath: root,
      type: 'node',
      language: 'javascript',
    });
  });

  it('falls back to directory name when package name is missing', async () => {
    const path = resolve('/repo/apps/portal');
    const fs = new InMemoryFileSystemReader({
      [`${path}/package.json`]: '{}',
    });
    const detector = new PackageJsonMarkerDetector(fs);

    await expect(detector.resolve(path)).resolves.toMatchObject({
      name: 'portal',
      language: 'javascript',
    });
  });
});
