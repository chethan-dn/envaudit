import { describe, expect, it } from 'vitest';
import { CargoTomlMarkerDetector } from '../../project-markers/cargo-toml-marker-detector.js';
import { InMemoryFileSystemReader } from '../in-memory-file-system.js';

describe('CargoTomlMarkerDetector', () => {
  it('resolves rust project from Cargo.toml', async () => {
    const root = '/repo/worker';
    const fs = new InMemoryFileSystemReader({
      [`${root}/Cargo.toml`]: '[package]\nname = "worker"\n',
    });
    const detector = new CargoTomlMarkerDetector(fs);

    await expect(detector.resolve(root)).resolves.toEqual({
      name: 'worker',
      rootPath: root,
      type: 'rust',
      language: 'rust',
    });
  });
});
