import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_ENV_AUDIT_CONFIG } from '../default-envaudit-config.js';
import { DefaultEnvAuditConfigLoader } from '../envaudit-config-loader.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');

function resolveFixturePath(name: string): string {
  return resolve(repoRoot, 'fixtures', name);
}

describe('DefaultEnvAuditConfigLoader', () => {
  const loader = new DefaultEnvAuditConfigLoader();
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('returns defaults when config file is missing', async () => {
    await expect(loader.load(import.meta.dirname)).resolves.toEqual(DEFAULT_ENV_AUDIT_CONFIG);
  });

  it('loads valid config from fixture', async () => {
    await expect(loader.load(resolveFixturePath('envaudit-config'))).resolves.toEqual({
      exclude: ['src/legacy/**'],
    });
  });

  it('throws for malformed JSON', async () => {
    const tempDir = await createTempConfigDir('{ invalid');
    tempDirs.push(tempDir);

    await expect(loader.load(tempDir)).rejects.toThrow('Invalid .envaudit.json: malformed JSON');
  });

  it('throws when exclude is not a string array', async () => {
    const tempDir = await createTempConfigDir(JSON.stringify({ exclude: [1, 2] }));
    tempDirs.push(tempDir);

    await expect(loader.load(tempDir)).rejects.toThrow(
      'Invalid .envaudit.json: "exclude" must be an array of strings',
    );
  });
});

async function createTempConfigDir(configContents: string): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), 'envaudit-config-'));
  await writeFile(join(tempDir, '.envaudit.json'), configContents, 'utf8');
  return tempDir;
}
