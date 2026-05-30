# CLAUDE.md

Guidance for Claude Code (claude.ai/code) and other coding agents working in this repository.

## Critical rules (read first)

These are easy to violate and hard to debug — front-loaded so attention picks them up.

1. **Never use `.ts` / `.tsx` extensions in import paths.** Vite, tsdown, and Bun all resolve extensionless imports under `moduleResolution: Bundler`. Using extensions causes `TS5097` and build failures.
2. **All packages are ESM-only** (`"type": "module"`). Do not introduce CJS output or `require()`.
3. **`exactOptionalPropertyTypes: true`** is set in `packages/config/tsconfig/base.json`. `apps/web/tsconfig.node.json` is the only file that overrides this (set to `false` for Playwright compatibility — note that Playwright itself has since been removed; see "Known stale references" below).
4. **Bun is the package manager** (`bun@1.2.15`, Node `>=22`). Do not use `npm install` / `yarn`.
5. **Auth boundary**: the web app is a pure API client — no auth SDK, no tokens in JS storage. Identity comes from an `HttpOnly` session cookie (`orvex.sid`) set by the API. Mutations require a CSRF double-submit cookie (`XSRF-TOKEN` header). Never put `SESSION_SECRET`, database credentials, SMTP passwords, or S3 keys in browser code.

## Project shape

This is a Turborepo + Bun monorepo for an uptime/monitoring product.

```
apps/
  web/      React 19 SPA (Vite + React Router v7 + TanStack Query + Zustand)
  api/      Express REST API (tsdown → Node, session-gated)
  worker/   Background jobs (tsdown → Node, node-cron)
packages/
  types/    @orvex/types    — shared TS types, enums, PLAN_LIMITS
  config/   @orvex/config   — tsconfig, ESLint, Prettier, tsdown presets (no build)
  database/ @orvex/database — Drizzle ORM schema, migrations, repositories
  cache/    @orvex/cache    — ioredis client + key/TTL factories
  mailer/   @orvex/mailer   — nodemailer + HTML email templates
  storage/  @orvex/storage  — local filesystem or S3 uploads (multer)
  logger/   @orvex/logger   — winston + express-winston middleware
  ui/       @orvex/ui       — shared React components (Vite library mode)
```

Turbo build order is derived from `dependsOn: ["^build"]`:
`config → types → logger/cache/mailer/storage/database → ui/api/worker → web`.

## Where to look (load on demand, don't pre-read)

Static context here is a **pointer map**, not a duplicate of the code. Open files only when the task touches them.

| Concern | Authoritative file |
|---|---|
| Build/lint/test task graph | `turbo.json` |
| Shared TS/ESLint/tsdown presets | `packages/config/` |
| Authenticated fetch wrapper + CSRF | `apps/web/src/lib/api-client.ts` |
| Auth store (Zustand) | `apps/web/src/stores/auth.store.ts` |
| Session middleware | `apps/api/src/config/session.ts` |
| CSRF middleware | `apps/api/src/middlewares/csrf.middleware.ts` |
| Passport OAuth | `apps/api/src/config/passport.ts` |
| API routes | `apps/api/src/routes/` |
| Cron scheduler & interval logic | `apps/worker/src/scheduler.ts` |
| Account purge job | `apps/worker/src/jobs/account-purge.ts` |
| Drizzle client + schema | `packages/database/src/client.ts`, `packages/database/src/schema/` |
| Repositories | `packages/database/src/repositories/` |
| SQL migrations | `packages/database/src/migrations/` |
| Redis client | `packages/cache/src/client.ts` |
| Cache keys & TTLs | `packages/cache/src/keys.ts` |
| Email transport + templates | `packages/mailer/src/` |
| File uploads (local/S3) | `packages/storage/src/` |

## Environment

Root `.env.example` consolidates all variables. Per-app examples live under `apps/api/.env.example`, `apps/worker/.env.example`, and `apps/web/.env.example`.

| Variable group | Used by |
|---|---|
| `DATABASE_URL` | API, worker, database package |
| `REDIS_URL` | API (sessions + cache), worker |
| `SESSION_*`, `CSRF_SECRET` | API |
| `SMTP_*`, `EMAIL_FROM` | API, worker |
| `STORAGE_*`, `S3_*` | API |
| `GOOGLE_*`, `GITHUB_*`, `OAUTH_CALLBACK_BASE_URL` | API (Passport OAuth) |
| `WEB_ORIGIN` | API (CORS, email links, OAuth redirects) |
| `VITE_DOCS_URL` | Web (optional public URL only) |

Before running anything, populate `.env` at the repo root (or per-app) with the variables those files reference.

## Commands

Run from the repo root unless noted.

```bash
bun install                              # install all workspaces

turbo dev                                # web :5173, api :3000, worker
turbo dev --filter=@orvex/api            # single app

turbo build                              # full build, dependency-ordered
turbo build --filter=@orvex/database...  # one package + its dependents

turbo typecheck
turbo lint
turbo lint -- --fix

bun run format         # prettier write
bun run format:check   # CI check

cd packages/database && bun run db:generate  # generate migration SQL after schema change
cd packages/database && bun run db:migrate   # apply migrations
cd packages/database && bun run db:push      # push schema directly (dev only)

bun run clean                            # nuke dist/ + node_modules/
```

Production bundles: `apps/api` and `apps/worker` emit one `dist/index.mjs` via tsdown (ESM, no DTS). `apps/web` emits `dist/` via Vite. Run Node apps with `node dist/index.mjs`.

## tsdown preset

`packages/config/tsdown/index.ts` is the single source of truth. Library packages do:

```ts
export { default } from "@orvex/config/tsdown";
```

Node app bundles override it: `tsdownPreset({ platform: "node", dts: false })`. Bump tsdown in one place; every package picks it up.

## ESLint config

Three flat-config presets in `packages/config/eslint/`:

- `base.ts` — JS + TS + import-x + unicorn + prettier compat (used everywhere)
- `node.ts` — extends base + `eslint-plugin-n` (used by `apps/api`, `apps/worker`, Node packages)
- `react.ts` — extends base + react/react-hooks/jsx-a11y (used by `apps/web`, `packages/ui`)

## Known stale references (don't follow blindly)

- **Playwright was removed.** `apps/web/playwright.config.ts` and `apps/web/tests/e2e/**` are deleted. `apps/web/package.json` still defines `test:e2e` / `test:e2e:ui` scripts and lists `@playwright/test` as a devDep, and `turbo.json` still has a `test:e2e` task. These references are dead — running them will fail. Either re-introduce e2e or strip the scripts; do not assume e2e exists.

## Agent skills

Skills are configured in `skills-lock.json` and stored under `.agents/skills/`. Invoke skills with the `Skill` tool; do not read skill files directly with `Read`.
