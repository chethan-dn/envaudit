import type { VariableUsage } from '@envdoctor/contracts';
import { Project, type SourceFile } from 'ts-morph';

export function createTsMorphProject(): Project {
  return new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
    },
  });
}

export function addSourceFiles(project: Project, filePaths: string[]): SourceFile[] {
  return filePaths.map((filePath) => project.addSourceFileAtPath(filePath));
}

function sortUsages(usages: VariableUsage[]): VariableUsage[] {
  return [...usages].sort((a, b) => {
    const fileCompare = a.sourceFile.localeCompare(b.sourceFile);
    if (fileCompare !== 0) {
      return fileCompare;
    }

    const lineCompare = (a.line ?? 0) - (b.line ?? 0);
    if (lineCompare !== 0) {
      return lineCompare;
    }

    return a.name.localeCompare(b.name);
  });
}

export { sortUsages };
