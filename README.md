# EnvAnalyser

Environment Intelligence CLI for discovering environment variable definitions, scanning code usage, and reporting configuration issues.

## Quick Start

```bash
npm install -g envanalyser
cd my-app
envanalyser scan
```

EnvAnalyser scans runtime env files (`.env`, etc.) and your TypeScript/JavaScript source, then reports mismatches such as missing, unused, or duplicate variables.

## Installation

```bash
# Global CLI (recommended)
npm install -g envanalyser

# Or run without installing
npx envanalyser scan .
```

Requirements:

- Node.js 22+

## Usage

```bash
# Scan current directory (human-readable output)
envanalyser scan

# Scan a repository path
envanalyser scan ./my-app

# Machine-readable JSON (RepositoryScanResult)
envanalyser scan --json

# Use a specific runtime env file
envanalyser scan --env .env.production
```

### Example scan

Given a project with `.env` and source files:

```bash
envanalyser scan ./my-app
```

Example output:

```text
Repository: /path/to/my-app

Summary
  Projects:    1
  Definitions: 4
  Usages:      3
  Issues:      2
  Scanned:     6
  Skipped:     0

── my-app (/path/to/my-app) ──

Definitions: 4
Usages:      3
Issues:      2
Scanned:     6
Skipped:     0

  ENV_MISSING (1)
    MISSING_FEATURE_FLAG
      src/app.ts:3

  ENV_UNUSED (1)
    LEGACY_TOKEN
      .env:4
```

When the same variable appears in multiple files, locations are grouped:

```text
  ENV_MISSING (1)
    API_KEY
      Used in:
        src/auth.ts:12
        src/client.ts:45
```

### Example JSON output

```bash
envanalyser scan --json
```

```json
{
  "rootPath": "/path/to/my-app",
  "summary": {
    "projectCount": 1,
    "definitionCount": 4,
    "usageCount": 3,
    "issueCount": 2,
    "scannedFileCount": 6,
    "skippedFileCount": 0
  },
  "results": [
    {
      "project": { "name": "my-app", "rootPath": "/path/to/my-app" },
      "issues": [
        {
          "code": "ENV_MISSING",
          "type": "missing",
          "variable": "API_KEY",
          "projectRootPath": "/path/to/my-app",
          "sourceFile": "/path/to/my-app/src/auth.ts",
          "line": 12,
          "locations": [
            { "sourceFile": "/path/to/my-app/src/auth.ts", "line": 12 },
            { "sourceFile": "/path/to/my-app/src/client.ts", "line": 45 }
          ],
          "message": "API_KEY is used but not defined in environment files"
        }
      ]
    }
  ]
}
```

### Supported patterns

EnvAnalyser detects static usage patterns such as:

```typescript
// process.env
const url = process.env.DATABASE_URL;
const port = process.env['PORT'];

// ConfigService (NestJS-style)
this.configService.get('JWT_SECRET');
this.configService.getOrThrow('API_KEY');

// Optional usage with fallback
const ttl = this.configService.get('THROTTLE_TTL', '60');
const debug = process.env.DEBUG ?? 'false';
```

See [docs/SUPPORTED_PATTERNS.md](./docs/SUPPORTED_PATTERNS.md) for the full list.

### Unsupported patterns

Not detected today:

- Dynamic keys: `process.env[key]`
- Helper wrappers around env access
- `registerAs` namespace mappings
- Runtime-generated variable names
- Parsing comments or markdown docs

### Issue types

| Code | Description | Example |
|------|-------------|---------|
| `ENV_MISSING` | Used in code, not in runtime env files | `process.env.FOO` with no `FOO=` in `.env` |
| `ENV_OPTIONAL` | Used with a code fallback, not in runtime env files | `config.get('TTL', '60')` |
| `ENV_UNCONFIGURED` | In validation schema and used in code, not in runtime env files | `SERVICE_URL` in `env.validation.ts` |
| `ENV_UNUSED` | Defined in runtime env files, never used | `LEGACY_TOKEN=` in `.env` only |
| `ENV_DUPLICATE` | Same name defined twice in one env file | Two `PORT=` lines in `.env` |
| `ENV_EMPTY` | Defined with an empty value | `LOG_LEVEL=` |

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Scan completed; no issues found |
| `1` | Scan completed; one or more issues found |
| `2` | Scan failed (invalid path, unexpected error) |

### Monorepo usage

EnvAnalyser discovers workspace projects (pnpm, npm, yarn) and scans each project independently.

```bash
# Scan entire monorepo
envanalyser scan .

# Scan a single package
envanalyser scan ./apps/api
```

In monorepos, runtime env files at the workspace root are included when scanning nested packages. Use `--env` to override which runtime file is used.

Optional repository config at `.envanalyser.json`:

```json
{
  "exclude": [
    "scripts/**",
    "evaluation/**",
    "legacy/**"
  ]
}
```

Built-in excludes always apply for common test files (`**/*.test.ts`, etc.), `dist/**`, and `coverage/**`.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Release validation (build, test, pack smoke test):

```bash
pnpm release:check
```

Create a changeset before merging user-facing changes:

```bash
pnpm changeset
```

Release flow uses [Changesets](https://github.com/changesets/changesets): `pnpm version` rewrites `workspace:*` dependencies to semver ranges before publish.

```bash
pnpm build:release
pnpm validate:pack
```

## Monorepo packages

| Package | Published | Role |
|---------|-----------|------|
| `envanalyser` | Yes | CLI entry (`envanalyser` binary) |
| `envanalyser-core` | Yes | Orchestration, discovery, analysis |
| `envanalyser-plugins` | Yes | Builtin plugin registry |
| `envanalyser-plugins-typescript` | Yes | TypeScript/JavaScript scanner (includes NestJS schema support) |
| `envanalyser-contracts` | Yes | Shared types and policy utilities |
| `@envaudit/plugins-javascript` | No | Private workspace stub (future) |
| `envanalyser-plugins-nestjs` | No | Private workspace package (bundled via TypeScript plugin) |

### Why are library packages public?

`npm install -g envanalyser` must resolve `envanalyser-core`, `envanalyser-plugins`, and their transitive dependencies from the npm registry. Publishing the dependency graph keeps installs reliable and leaves room for programmatic use of `envanalyser-core` later.

## License

MIT — see [LICENSE](./LICENSE).
