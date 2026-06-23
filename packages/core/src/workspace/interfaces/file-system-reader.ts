export interface FileSystemReader {
  exists(filePath: string): Promise<boolean>;
  readFile(filePath: string): Promise<string>;
  readJson<T>(filePath: string): Promise<T>;
  readdir(dirPath: string): Promise<string[]>;
}
