# @envdoctor/contracts

## 0.1.3

### Patch Changes

- Optional environment variables are detected AST-only in two places:

## 0.1.2

### Patch Changes

- NestJS ConfigService access is detected via AST analysis in a new ConfigServiceUsageExtractor (plugins-nestjs). It finds CallExpression nodes where:

## 0.1.1

### Patch Changes

- Resolve workspace root by walking up from the scan path (pnpm/nx/turbo/package.json workspaces).

## 0.1.0

### Minor Changes

- Initial public release of EnvDoctor.
