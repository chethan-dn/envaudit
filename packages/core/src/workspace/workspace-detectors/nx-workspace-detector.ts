import { basename, resolve } from 'node:path';
import fg from 'fast-glob';
import type { WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import type { WorkspaceManagerDetector } from '../interfaces/workspace-manager-detector.js';
import { getGlobIgnorePatterns } from '../utils/glob-expand.js';

interface NxConfig {
  projects?: Record<string, string>;
}

export class NxWorkspaceDetector implements WorkspaceManagerDetector {
  readonly id = 'nx';

  constructor(private readonly fs: FileSystemReader) {}

  async detect(rootPath: string): Promise<boolean> {
    return this.fs.exists(resolve(rootPath, 'nx.json'));
  }

  async discover(rootPath: string): Promise<WorkspaceProject[]> {
    const normalizedRoot = resolve(rootPath);
    const projects = new Map<string, WorkspaceProject>();

    const nxConfigPath = resolve(normalizedRoot, 'nx.json');
    if (await this.fs.exists(nxConfigPath)) {
      const nxConfig = await this.fs.readJson<NxConfig>(nxConfigPath);
      if (nxConfig.projects) {
        for (const [name, projectPath] of Object.entries(nxConfig.projects)) {
          const absolutePath = resolve(normalizedRoot, projectPath);
          projects.set(absolutePath, { name, rootPath: absolutePath });
        }
      }
    }

    const projectJsonDirs = await fg('**/project.json', {
      cwd: normalizedRoot,
      absolute: true,
      onlyFiles: true,
      ignore: getGlobIgnorePatterns(),
    });

    for (const projectJsonPath of projectJsonDirs) {
      const projectPath = resolve(projectJsonPath, '..');
      if (projects.has(projectPath)) {
        continue;
      }

      projects.set(projectPath, {
        name: basename(projectPath),
        rootPath: projectPath,
      });
    }

    return [...projects.values()].sort((a, b) => a.rootPath.localeCompare(b.rootPath));
  }
}
