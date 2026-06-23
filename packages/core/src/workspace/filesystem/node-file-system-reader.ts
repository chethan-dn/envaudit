import { readFile, readdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';

export class NodeFileSystemReader implements FileSystemReader {
  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath: string): Promise<string> {
    return readFile(filePath, 'utf-8');
  }

  async readJson<T>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath);
    return JSON.parse(content) as T;
  }

  async readdir(dirPath: string): Promise<string[]> {
    return readdir(dirPath);
  }
}
