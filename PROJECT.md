# EnvAudit

## Vision

Environment Intelligence CLI.

Analyze repositories and monorepos.

Detect:

- Missing variables
- Empty variables
- Duplicate variables
- Unused variables
- Environment drift
- Variable usage

## Commands

envaudit scan
envaudit compare
envaudit explain <variable>
envaudit generate

## Architecture

Plugin-based architecture.

Core must not know about languages.

Scanner plugins discover variables.

## V1

Supported:

- TypeScript
- JavaScript
- NestJS

Not supported:

- Docker
- Kubernetes
- GitHub Actions

Dependency Rules

CLI -> Core

Core -> Contracts

Plugins -> Contracts

Plugins -> Core (optional)

Core MUST NOT depend on Plugins

Contracts MUST depend on nothing

Future:

Each scanner becomes an independent package.
