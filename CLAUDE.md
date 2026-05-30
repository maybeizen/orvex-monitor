# CLAUDE.md

Guidance for Claude Code (claude.ai/code) and other coding agents working in this repository.

## Critical rules (read first)

These are easy to violate and hard to debug — front-loaded so attention picks them up.

1. **Never use `.ts` / `.tsx` extensions in import paths.** Vite, tsdown, and Bun all resolve extensionless imports under `moduleResolution: Bundler`. Using extensions causes `TS5097` and build failures.
2. **All packages are ESM-only** (`"type": "module"`). Do not introduce CJS output or `require()`.
3. **`exactOptionalPropertyTypes: true`** is set in `packages/config/tsconfig/base.json`. `apps/web/tsconfig.node.json` is the only file that overrides this (set to `false` for Playwright compatibility — note that Playwright itself has since been removed; see "Known stale references" below).
4. **Bun is the package manager** (`bun@1.2.15`, Node `>=22`). Do not use `npm install` / `yarn`.
5. **Auth boundary**: the web app uses Supabase anon key and attaches a JWT to every API call; the API and worker use the **service role key** and bypass RLS. Never put the service role key in browser code.

## Project shape

This is a Turborepo + Bun monorepo for an uptime/monitoring product.

```
apps/
  web/      React 19 SPA (Vite + React Router v7 + TanStack Query + Zustand)
  api/      Express REST API (tsdown → Node, JWT-gated)
  worker/   Uptime check scheduler (tsdown → Node, node-cron)
packages/
  types/    @orvex/types    — shared TS types, enums, PLAN_LIMITS
  config/   @orvex/config   — tsconfig, ESLint, Prettier, tsdown presets (no build)
  database/ @orvex/database — Supabase clients + repositories
  cache/    @orvex/cache    — Upstash Redis client + key/TTL factories
  logger/   @orvex/logger   — winston + express-winston middleware
  ui/       @orvex/ui       — shared React components (Vite library mode)
supabase/
  migrations/  SQL run against the remote Supabase project
```

Turbo build order is derived from `dependsOn: ["^build"]`:
`config → types → logger/cache/database → ui/api/worker → web`.

## Where to look (load on demand, don't pre-read)

Static context here is a **pointer map**, not a duplicate of the code. Open files only when the task touches them.

| Concern | Authoritative file |
|---|---|
| Build/lint/test task graph | `turbo.json` |
| Shared TS/ESLint/tsdown presets | `packages/config/` |
| Browser Supabase client | `apps/web/src/lib/supabase.ts` |
| Authenticated fetch wrapper | `apps/web/src/lib/api-client.ts` |
| Auth store (Zustand) | `apps/web/src/stores/auth.store.ts` |
| API JWT middleware | `apps/api/src/middleware/auth.ts` |
| API routes | `apps/api/src/routes/` |
| Cron scheduler & interval logic | `apps/worker/src/scheduler.ts` |
| Uptime check job | `apps/worker/src/jobs/uptime-check.ts` |
| Supabase service-role / anon clients | `packages/database/src/client.ts` |
| Repositories | `packages/database/src/repositories/` |
| Generated Supabase types | `packages/database/src/types.ts` (regen via `bun run db:types`) |
| Cache keys & TTLs | `packages/cache/src/index.ts` |
| SQL schema (13 tables, all RLS-enabled) | `supabase/migrations/` |

## Environment

`.env.example` is currently empty (known gap). The required variables can be discovered from where they're consumed:

- **Supabase** (service role + anon URL/key): see `packages/database/src/client.ts`
- **Supabase browser** (`VITE_SUPABASE_*`): see `apps/web/src/lib/supabase.ts`
- **Upstash Redis**: see `packages/cache/src/index.ts`

Before running anything, populate `.env` at the repo root with the variables those files reference.

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

cd packages/database && bun run db:types # regenerate Supabase types after a migration

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
- **`.env.example` is empty.** See the Environment section above.

## Agent skills

Skills are configured in `skills-lock.json` and stored under `.agents/skills/`. Invoke skills with the `Skill` tool; do not read skill files directly with `Read`.
