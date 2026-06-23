import { basename, resolve } from 'node:path';
import type { WorkspaceProject } from '@envdoctor/contracts';
import type { FileSystemReader } from '../interfaces/file-system-reader.js';
import { expandWorkspaceGlobs } from '../utils/glob-expand.js';

export async function discoverFromWorkspacePatterns(
  fs: FileSystemReader,
  rootPath: string,
  patterns: string[],
): Promise<WorkspaceProject[]> {
  const projectPaths = await expandWorkspaceGlobs(rootPath, patterns);
  const projects: WorkspaceProject[] = [];

  for (const projectPath of projectPaths) {
    const packageJsonPath = resolve(projectPath, 'package.json');
    if (await fs.exists(packageJsonPath)) {
      const packageJson = await fs.readJson<{ name?: string }>(packageJsonPath);
      projects.push({
        name: packageJson.name ?? basename(projectPath),
        rootPath: projectPath,
      });
      continue;
    }

    projects.push({
      name: basename(projectPath),
      rootPath: projectPath,
    });
  }

  return projects;
}
