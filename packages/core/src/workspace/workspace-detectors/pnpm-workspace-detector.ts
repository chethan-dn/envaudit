import { resolve } from 'node:path';
import type { WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { WorkspaceManagerDetector } from '../interfaces/workspace-manager-detector.js';
import { discoverFromWorkspacePatterns } from '../utils/discover-from-workspace-patterns.js';

export class PnpmWorkspaceDetector implements WorkspaceManagerDetector {
  readonly id = 'pnpm';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(rootPath: string): Promise<boolean> {
    return this.fs.exists(resolve(rootPath, 'pnpm-workspace.yaml'));
  }

  async discover(rootPath: string): Promise<WorkspaceProject[]> {
    const configPath = resolve(rootPath, 'pnpm-workspace.yaml');
    const content = await this.fs.readFile(configPath);
    const patterns = parsePnpmPackages(content);

    if (patterns.length === 0) {
      return [];
    }

    return discoverFromWorkspacePatterns(this.fs, rootPath, patterns);
  }
}

function parsePnpmPackages(content: string): string[] {
  const patterns: string[] = [];
  const lines = content.split('\n');

  let inPackages = false;
  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'packages:') {
      inPackages = true;
      continue;
    }

    if (!inPackages) {
      continue;
    }

    if (trimmed.startsWith('- ')) {
      patterns.push(trimmed.slice(2).replace(/^['"]|['"]$/g, ''));
      continue;
    }

    if (trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
      break;
    }
  }

  return patterns;
}
