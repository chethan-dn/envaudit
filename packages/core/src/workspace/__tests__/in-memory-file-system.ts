import { dirname, resolve } from 'node:path';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';

export class InMemoryFileSystemReader implements FileSystemReader {
  private readonly files = new Map<string, string>();
  private readonly directories = new Set<string>();

  constructor(seed?: Record<string, string>) {
    if (seed) {
      for (const [filePath, content] of Object.entries(seed)) {
        this.addFile(filePath, content);
      }
    }
  }

  addFile(filePath: string, content: string): void {
    const normalized = resolve(filePath);
    this.files.set(normalized, content);

    let dir = dirname(normalized);
    while (!this.directories.has(dir)) {
      this.directories.add(dir);
      const parent = dirname(dir);
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const normalized = resolve(filePath);
    return this.files.has(normalized) || this.directories.has(normalized);
  }

  async readFile(filePath: string): Promise<string> {
    const normalized = resolve(filePath);
    const content = this.files.get(normalized);
    if (content === undefined) {
      throw new Error(`File not found: ${normalized}`);
    }

    return content;
  }

  async readJson<T>(filePath: string): Promise<T> {
    return JSON.parse(await this.readFile(filePath)) as T;
  }

  async readdir(dirPath: string): Promise<string[]> {
    const normalized = resolve(dirPath);
    const entries = new Set<string>();
    const prefix = `${normalized}/`;

    for (const filePath of this.files.keys()) {
      if (!filePath.startsWith(prefix)) {
        continue;
      }

      const remainder = filePath.slice(prefix.length);
      const [entry] = remainder.split('/');
      if (entry) {
        entries.add(entry);
      }
    }

    return [...entries].sort();
  }
}
