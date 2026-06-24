# Supported Detection Patterns

This document describes what EnvAudit detects today. It reflects the current implementation, not a roadmap.

## Supported

### Runtime environment files

- `.env` and other runtime env files discovered per project
- Workspace-root env files for nested monorepo projects
- `.env.example` and other documentation env files (definitions only; not used for runtime matching)
- Explicit runtime override via `envaudit scan --env <path>`

### Usage extraction (TypeScript / JavaScript)

- `process.env.FOO`
- `process.env['FOO']` and `process.env["FOO"]`
- `process.env.FOO ?? fallback` and `process.env.FOO || fallback` (reported as optional usage)
- `configService.get('FOO')`
- `configService.getOrThrow('FOO')`
- `this.configService.get('FOO')` and `this.configService.getOrThrow('FOO')`
- `configService.get('FOO', defaultValue)` when the second argument is a literal (reported as optional usage)
- Config wrapper getter access mapped to env names, for example `appConfig.databaseUrl` → `DATABASE_URL`

### Schema extraction (NestJS)

- `env.validation.ts` class properties (for example `DATABASE_URL: string`)
- Optional schema properties (`OPENAI_API_KEY?: string`)
- Schema properties with inline defaults (`THROTTLE_LIMIT: number = 100`)

### Issue types

| Code | Meaning |
|------|---------|
| `ENV_MISSING` | Variable is used in code but not defined in runtime env files |
| `ENV_OPTIONAL` | Variable is used with a code fallback and is not defined in runtime env files |
| `ENV_UNCONFIGURED` | Variable is used in code and declared in a validation schema, but not defined in runtime env files |
| `ENV_UNUSED` | Variable is defined in runtime env files but never referenced in scanned code |
| `ENV_DUPLICATE` | The same variable name appears more than once in a single runtime env file |
| `ENV_EMPTY` | Variable is defined in a runtime env file with an empty value |

## Not supported

- Dynamic env keys (`process.env[key]`, computed property names)
- Helper functions that wrap env access
- `registerAs` config namespace mappings
- Runtime-generated env variable names
- Comment parsing in source files
- Markdown or prose documentation parsing
- Non-literal `ConfigService.get()` default values (optional detection requires a literal fallback)
- Cross-file duplicate detection across different runtime env files (duplicates are reported within a single file)

## Reporting behavior

- Issues are grouped by variable name and issue code
- All usage locations are preserved in JSON output under `locations`
- Human-readable output lists grouped locations under `Used in:` when a variable appears in multiple places
