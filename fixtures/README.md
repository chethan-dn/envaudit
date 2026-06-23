# Product Fixtures

Long-lived reference repositories for EnvDoctor development and future E2E tests.

These are **not** unit-test mocks. They are minimal on-disk sample projects reused across milestones.

## Rules

- No real secrets — placeholder values only
- No `node_modules`, lockfiles, or generated artifacts
- Keep fixtures tiny; add files only when a milestone requires them

## Fixtures

| Fixture | Purpose | Milestones |
|---------|---------|------------|
| `single-js/` | Single JavaScript project (no `tsconfig.json`) | M2 discovery, M4 issues, M5 JS scanner |
| `single-ts/` | Single TypeScript project | M2 discovery, M5 TS scanner |
| `pnpm-monorepo/` | pnpm workspace with two apps and env files | M2 discovery, M3 env, M4 issues, M6 generate, E2E |
| `mixed-python-node/` | Polyglot python + node layout without a workspace manager | M3 env, M4 issues, future discovery |
| `env-heavy/` | Many env file variants in one project | **M3 env discovery** (primary) |
| `empty/` | Minimal repo with no project markers | M2 fallback discovery, E2E edge cases |

## Known limitations

### `mixed-python-node/`

This fixture represents a **future discovery scenario**: a repository with separate `backend/` (Python) and `frontend/` (Node) projects and no workspace manager file.

The current discovery engine may **not** discover both projects automatically — it may fall back to a single project at the repository root. The fixture exists to support future milestones and discovery improvements.
