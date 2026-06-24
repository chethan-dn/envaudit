import { resolve } from 'node:path';
import type { FileSystemReader } from '../../workspace/interfaces/file-system-reader.js';
import { compareEnvFiles, isEnvFile } from './env-file-matcher.js';

export async function discoverEnvFilesInDirectory(
  fs: FileSystemReader,
  directoryPath: string,
): Promise<string[]> {
  const normalizedPath = resolve(directoryPath);

  if (!(await fs.exists(normalizedPath))) {
    return [];
  }

  let entries: string[];
  try {
    entries = await fs.readdir(normalizedPath);
  } catch {
    return [];
  }

  return entries
    .filter((entry) => isEnvFile(entry))
    .map((entry) => resolve(normalizedPath, entry))
    .sort(compareEnvFiles);
}
