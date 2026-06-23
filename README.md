# EnvDoctor

Environment Intelligence CLI for discovering environment variable definitions, scanning code usage, and reporting configuration issues.

## Requirements

- Node.js 22+
- pnpm 10+ (development)

## Install

```bash
npm install -g @envdoctor/cli
envdoctor --help
envdoctor scan .
```

The global binary is named `envdoctor`.

## Usage

```bash
# Scan current directory (human-readable output)
envdoctor scan

# Scan a repository path
envdoctor scan ./my-app

# Machine-readable JSON (RepositoryScanResult)
envdoctor scan --json
```

### Configuration

Optional repository config at `.envdoctor.json`:

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
| `@envdoctor/cli` | Yes | CLI entry (`envdoctor` binary) |
| `@envdoctor/core` | Yes | Orchestration, discovery, analysis |
| `@envdoctor/plugins` | Yes | Builtin plugin registry |
| `@envdoctor/plugins-typescript` | Yes | TypeScript/JavaScript scanner |
| `@envdoctor/contracts` | Yes | Shared types and policy utilities |
| `@envdoctor/plugins-javascript` | No | Private workspace stub (future) |
| `@envdoctor/plugins-nestjs` | No | Private workspace stub (future) |

### Why are library packages public?

`npm install -g @envdoctor/cli` must resolve `@envdoctor/core`, `@envdoctor/plugins`, and their transitive dependencies from the npm registry. A CLI-only public package would require bundling those libraries into the CLI tarball; that is not implemented yet. Publishing the dependency graph keeps installs reliable and leaves room for programmatic use of `@envdoctor/core` later.

## License

MIT — see [LICENSE](./LICENSE).
