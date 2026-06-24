import { relative } from 'node:path';
import type { EnvironmentFileSummary, Issue, RepositoryScanResult, ScanResult } from '@envdoctor/core';
import type { ScanReporter } from './interfaces/scan-reporter.js';

const ISSUE_CODE_ORDER = ['ENV_DUPLICATE', 'ENV_EMPTY', 'ENV_MISSING', 'ENV_UNUSED'] as const;

export class HumanScanReporter implements ScanReporter {
  render(result: RepositoryScanResult): string {
    const lines: string[] = [];

    lines.push(`Repository: ${result.rootPath}`);
    lines.push('');
    lines.push('Summary');
    lines.push(`  Projects:    ${result.summary.projectCount}`);
    lines.push(`  Definitions: ${result.summary.definitionCount}`);
    lines.push(`  Usages:      ${result.summary.usageCount}`);
    lines.push(`  Issues:      ${result.summary.issueCount}`);
    lines.push(`  Scanned:     ${result.summary.scannedFileCount}`);
    lines.push(`  Skipped:     ${result.summary.skippedFileCount}`);
    lines.push('');

    for (const scanResult of result.results) {
      lines.push(...this.renderProject(scanResult));
      lines.push('');
    }

    return `${lines.join('\n').trimEnd()}\n`;
  }

  private renderProject(scanResult: ScanResult): string[] {
    const { project } = scanResult;
    const lines: string[] = [];

    lines.push(`── ${project.name} (${project.rootPath}) ──`);
    lines.push('');
    lines.push(`Definitions: ${scanResult.definitions.length}`);
    lines.push(`Usages:      ${scanResult.usages.length}`);
    lines.push(`Issues:      ${scanResult.issues.length}`);
    lines.push(`Scanned:     ${scanResult.metrics.scannedFileCount}`);
    lines.push(`Skipped:     ${scanResult.metrics.skippedFileCount}`);
    lines.push('');

    if (scanResult.environmentFiles) {
      lines.push(...this.renderEnvironmentFiles(scanResult.environmentFiles, project.rootPath));
      lines.push('');
    }

    if (scanResult.issues.length === 0) {
      lines.push('  No issues found.');
      return lines;
    }

    const grouped = groupIssuesByCode(scanResult.issues);

    for (const code of ISSUE_CODE_ORDER) {
      const issues = grouped.get(code);
      if (!issues || issues.length === 0) {
        continue;
      }

      lines.push(`  ${code} (${issues.length})`);

      for (const issue of issues) {
        lines.push(`    ${issue.variable}`);
        const location = formatSourceLocation(issue, project.rootPath);
        if (location) {
          lines.push(`      ${location}`);
        }
        if (issue.message) {
          lines.push(`      ${issue.message}`);
        }
      }

      lines.push('');
    }

    if (lines.at(-1) === '') {
      lines.pop();
    }

    return lines;
  }

  private renderEnvironmentFiles(
    environmentFiles: EnvironmentFileSummary,
    projectRootPath: string,
  ): string[] {
    const lines: string[] = ['Environment Files', ''];

    lines.push('  Runtime:');
    if (environmentFiles.runtime.length === 0) {
      lines.push('    (none)');
    } else {
      for (const filePath of environmentFiles.runtime) {
        lines.push(`    ${toDisplayPath(filePath, projectRootPath)}`);
      }
    }

    lines.push('');
    lines.push('  Documentation:');
    if (environmentFiles.documentation.length === 0) {
      lines.push('    (none)');
    } else {
      for (const filePath of environmentFiles.documentation) {
        lines.push(`    ${toDisplayPath(filePath, projectRootPath)}`);
      }
    }

    return lines;
  }
}

function groupIssuesByCode(issues: Issue[]): Map<string, Issue[]> {
  const grouped = new Map<string, Issue[]>();

  for (const issue of issues) {
    const existing = grouped.get(issue.code) ?? [];
    existing.push(issue);
    grouped.set(issue.code, existing);
  }

  return grouped;
}

function formatSourceLocation(issue: Issue, projectRootPath: string): string {
  if (!issue.sourceFile) {
    return '';
  }

  const relativePath = toProjectRelativePath(issue.sourceFile, projectRootPath);
  if (issue.line !== undefined) {
    return `${relativePath}:${issue.line}`;
  }

  return relativePath;
}

function toProjectRelativePath(sourceFile: string, projectRootPath: string): string {
  const prefix = `${projectRootPath}/`;
  if (sourceFile.startsWith(prefix)) {
    return sourceFile.slice(prefix.length);
  }

  return sourceFile;
}

function toDisplayPath(filePath: string, projectRootPath: string): string {
  const relativePath = relative(projectRootPath, filePath);
  if (relativePath && !relativePath.startsWith('..') && !relativePath.startsWith('/')) {
    return relativePath;
  }

  if (relativePath) {
    return relativePath;
  }

  return filePath;
}
