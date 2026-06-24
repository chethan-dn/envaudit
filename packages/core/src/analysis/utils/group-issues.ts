import type { Issue, IssueLocation } from 'envaudit-contracts';
import { sortIssues } from './sort-issues.js';

function issueGroupKey(issue: Issue): string {
  return `${issue.code}\0${issue.variable}\0${issue.projectRootPath}`;
}

function toLocation(issue: Issue): IssueLocation {
  return {
    sourceFile: issue.sourceFile,
    line: issue.line,
  };
}

function locationKey(location: IssueLocation): string {
  return `${location.sourceFile ?? ''}\0${location.line ?? ''}`;
}

function compareLocations(a: IssueLocation, b: IssueLocation): number {
  const fileCompare = (a.sourceFile ?? '').localeCompare(b.sourceFile ?? '');
  if (fileCompare !== 0) {
    return fileCompare;
  }

  return (a.line ?? 0) - (b.line ?? 0);
}

function mergeLocations(existing: IssueLocation[], next: IssueLocation): IssueLocation[] {
  const key = locationKey(next);
  if (existing.some((location) => locationKey(location) === key)) {
    return existing;
  }

  return [...existing, next].sort(compareLocations);
}

export function groupIssues(issues: Issue[]): Issue[] {
  const groups = new Map<string, Issue>();

  for (const issue of issues) {
    const key = issueGroupKey(issue);
    const location = toLocation(issue);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        ...issue,
        sourceFile: location.sourceFile,
        line: location.line,
        locations: [location],
      });
      continue;
    }

    existing.locations = mergeLocations(existing.locations ?? [toLocation(existing)], location);
    existing.sourceFile = existing.locations[0]?.sourceFile;
    existing.line = existing.locations[0]?.line;
  }

  return sortIssues([...groups.values()]);
}
