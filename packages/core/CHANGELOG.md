# @envdoctor/core

## 0.2.0

### Minor Changes

- Initial public release with NestJS ConfigService support,

### Patch Changes

- Updated dependencies
  - @envdoctor/contracts@0.2.0

## 0.1.4

### Patch Changes

- Enhance ConfigServiceUsageExtractor and introduce ConfigWrapper support
- Updated dependencies
  - @envdoctor/contracts@0.1.4

## 0.1.3

### Patch Changes

- Optional environment variables are detected AST-only in two places:
- Updated dependencies
  - @envdoctor/contracts@0.1.3

## 0.1.2

### Patch Changes

- NestJS ConfigService access is detected via AST analysis in a new ConfigServiceUsageExtractor (plugins-nestjs). It finds CallExpression nodes where:
- Updated dependencies
  - @envdoctor/contracts@0.1.2

## 0.1.1

### Patch Changes

- Resolve workspace root by walking up from the scan path (pnpm/nx/turbo/package.json workspaces).
- Updated dependencies
  - @envdoctor/contracts@0.1.1

## 0.1.0

### Minor Changes

- Initial public release of EnvDoctor.

### Patch Changes

- Updated dependencies
  - @envdoctor/contracts@0.1.0
