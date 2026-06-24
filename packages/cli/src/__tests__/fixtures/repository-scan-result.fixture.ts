import type { RepositoryScanResult } from 'envaudit-core';

const defaultMetrics = {
  scannedFileCount: 3,
  skippedFileCount: 1,
};

export const sampleRepositoryScanResult: RepositoryScanResult = {
  rootPath: '/repo',
  summary: {
    projectCount: 1,
    definitionCount: 2,
    usageCount: 1,
    issueCount: 2,
    scannedFileCount: 3,
    skippedFileCount: 1,
  },
  results: [
    {
      project: {
        name: 'api',
        rootPath: '/repo/apps/api',
      },
      definitions: [
        {
          name: 'PORT',
          value: '3000',
          sourceFile: '/repo/apps/api/.env',
          projectRootPath: '/repo/apps/api',
          line: 1,
        },
        {
          name: 'UNUSED_KEY',
          value: 'secret',
          sourceFile: '/repo/apps/api/.env',
          projectRootPath: '/repo/apps/api',
          line: 2,
        },
      ],
      usages: [
        {
          name: 'MISSING_KEY',
          sourceFile: '/repo/apps/api/src/index.ts',
          projectRootPath: '/repo/apps/api',
          line: 4,
          confidence: 'high',
          usageType: 'env',
        },
      ],
      issues: [
        {
          code: 'ENV_MISSING',
          type: 'missing',
          variable: 'MISSING_KEY',
          projectRootPath: '/repo/apps/api',
          sourceFile: '/repo/apps/api/src/index.ts',
          line: 4,
          message: 'MISSING_KEY is used but not defined in environment files',
        },
        {
          code: 'ENV_UNUSED',
          type: 'unused',
          variable: 'UNUSED_KEY',
          projectRootPath: '/repo/apps/api',
          sourceFile: '/repo/apps/api/.env',
          line: 2,
          message: 'UNUSED_KEY is defined but never used',
        },
      ],
      metrics: defaultMetrics,
      environmentFiles: {
        runtime: ['/repo/apps/api/.env'],
        documentation: [],
      },
    },
  ],
};

export const groupedRepositoryScanResult: RepositoryScanResult = {
  rootPath: '/repo',
  summary: {
    projectCount: 1,
    definitionCount: 0,
    usageCount: 2,
    issueCount: 1,
    scannedFileCount: 2,
    skippedFileCount: 0,
  },
  results: [
    {
      project: {
        name: 'api',
        rootPath: '/repo/apps/api',
      },
      definitions: [],
      usages: [],
      issues: [
        {
          code: 'ENV_MISSING',
          type: 'missing',
          variable: 'MISSING_KEY',
          projectRootPath: '/repo/apps/api',
          sourceFile: '/repo/apps/api/src/fileA.ts',
          line: 35,
          locations: [
            { sourceFile: '/repo/apps/api/src/fileA.ts', line: 35 },
            { sourceFile: '/repo/apps/api/src/fileB.ts', line: 171 },
          ],
          message: 'MISSING_KEY is used but not defined in environment files',
        },
      ],
      metrics: {
        scannedFileCount: 2,
        skippedFileCount: 0,
      },
    },
  ],
};

export const cleanRepositoryScanResult: RepositoryScanResult = {
  rootPath: '/repo/clean',
  summary: {
    projectCount: 1,
    definitionCount: 1,
    usageCount: 1,
    issueCount: 0,
    scannedFileCount: 2,
    skippedFileCount: 0,
  },
  results: [
    {
      project: {
        name: 'clean-app',
        rootPath: '/repo/clean/apps/clean-app',
      },
      definitions: [
        {
          name: 'API_KEY',
          value: 'value',
          sourceFile: '/repo/clean/apps/clean-app/.env',
          projectRootPath: '/repo/clean/apps/clean-app',
          line: 1,
        },
      ],
      usages: [
        {
          name: 'API_KEY',
          sourceFile: '/repo/clean/apps/clean-app/src/app.ts',
          projectRootPath: '/repo/clean/apps/clean-app',
          line: 1,
          confidence: 'high',
          usageType: 'env',
        },
      ],
      issues: [],
      metrics: {
        scannedFileCount: 2,
        skippedFileCount: 0,
      },
    },
  ],
};

export const monorepoRepositoryScanResult: RepositoryScanResult = {
  rootPath: '/repo/monorepo',
  summary: {
    projectCount: 2,
    definitionCount: 2,
    usageCount: 0,
    issueCount: 2,
    scannedFileCount: 4,
    skippedFileCount: 0,
  },
  results: [
    {
      project: {
        name: 'web',
        rootPath: '/repo/monorepo/apps/web',
      },
      definitions: [
        {
          name: 'WEB_PORT',
          value: '3000',
          sourceFile: '/repo/monorepo/apps/web/.env',
          projectRootPath: '/repo/monorepo/apps/web',
          line: 1,
        },
      ],
      usages: [],
      issues: [
        {
          code: 'ENV_UNUSED',
          type: 'unused',
          variable: 'WEB_PORT',
          projectRootPath: '/repo/monorepo/apps/web',
          sourceFile: '/repo/monorepo/apps/web/.env',
          line: 1,
          message: 'WEB_PORT is defined but never used',
        },
      ],
      metrics: {
        scannedFileCount: 2,
        skippedFileCount: 0,
      },
    },
    {
      project: {
        name: 'api',
        rootPath: '/repo/monorepo/apps/api',
      },
      definitions: [
        {
          name: 'API_PORT',
          value: '4000',
          sourceFile: '/repo/monorepo/apps/api/.env',
          projectRootPath: '/repo/monorepo/apps/api',
          line: 1,
        },
      ],
      usages: [],
      issues: [
        {
          code: 'ENV_UNUSED',
          type: 'unused',
          variable: 'API_PORT',
          projectRootPath: '/repo/monorepo/apps/api',
          sourceFile: '/repo/monorepo/apps/api/.env',
          line: 1,
          message: 'API_PORT is defined but never used',
        },
      ],
      metrics: {
        scannedFileCount: 2,
        skippedFileCount: 0,
      },
    },
  ],
};
