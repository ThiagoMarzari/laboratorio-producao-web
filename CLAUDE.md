# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Monorepo-style layout (git repo, branch `main`; root `.gitignore` excludes `.env` — `.env.example` is the template) with two top-level dirs:

- `backend/` — NestJS 12 app (strict mode). Default `AppController` (GET `/` → "Hello World!") plus `HealthModule` (GET `/health` → `{ status, database, uptime, timestamp }`; runs `select 1` and returns 503 if Postgres is down), `UsersModule` (CRUD on `/users`), `ReportsModule` (prep for Redis/queues/cluster, see below). Postgres via Drizzle ORM v1 (rc) + `@nestjs/drizzle` + `pg`.
- `frontend/` — Vue 3 + TypeScript + Vite app styled with Tailwind CSS v4 + shadcn-vue. Routes: `/` (`HomeView`: project roadmap/progress driven by `src/data/roadmap.ts`, plus `HealthStatus` polling `/api/health`), `/deploy` (`DeployView`), `/docker` (`DockerView`: Docker vs Compose reference — images vs containers, Dockerfile, commands — driven by `src/data/docker.ts`), `/usuarios` (`UsersView`: CRUD playground for `/api/users` with a "last request" panel) and `/relatorios` (`ReportsView`: one button that calls `GET /api/reports/sales?months=` and renders the sales report, plus `LoadSimulation.vue`: fires N simultaneous calls to that endpoint and shows per-request times, errors and `/health` latency before vs during). The "last request" panel is the shared `LastRequest.vue`; `src/lib/reports.ts` has the report types and `reportsApi`. API calls go through `src/lib/api.ts` (`api()` returns `{ ok, status, dados, … }` instead of throwing on HTTP errors); `src/lib/users.ts` has the `User` types and `usersApi`.

## Frontend commands (run from `frontend/`)

Package manager is **npm** (lockfile is `package-lock.json`; Node `^22.18.0 || >=24.12.0`).

```sh
npm install
npm run dev         # Vite dev server (port 5173)
npm run build       # runs type-check and vite build in parallel (npm-run-all2)
npm run type-check  # vue-tsc --build
npm run preview
```

No test runner or linter is configured yet.

## Backend commands (run from `backend/`)

npm (lockfile is `package-lock.json`, same as the frontend); ESM project (`"type": "module"`, relative imports need `.js` suffix).

```sh
npm install
npm run start:dev   # nest start --watch, port 3000 (or $PORT)
npm run build       # nest build -> dist/
npm run start:prod  # node dist/main.js
npm test            # vitest; npm run test:e2e for test/*.e2e-spec.ts
npm run lint        # oxlint
npm run db:generate -- --name <name>  # drizzle-kit: diff src/db/schema.ts -> new drizzle/<timestamp>_<name>/
npm run db:migrate  # apply drizzle/ to $DATABASE_URL (needs `docker compose up -d postgres`)
npm run db:seed     # populate users/products/orders (SEED_ORDERS, default 1M; idempotent) for the sales report
npm run db:studio
```

Host dev reads `backend/.env` (`DATABASE_URL` pointing at `localhost:5432`; template in `backend/.env.example`). Compose publishes Postgres only on `127.0.0.1:5432`.

## Architecture notes

- Vite config registers `@vitejs/plugin-vue`, `vite-plugin-vue-devtools` and `@tailwindcss/vite`; `@` aliases `frontend/src` (also declared in root `tsconfig.json` `paths` for the shadcn-vue CLI — no `baseUrl`, it's deprecated in TS 6). `server.proxy` maps `/api/*` to `localhost:3000` in dev, mirroring nginx in prod.
- UI: shadcn-vue (`frontend/components.json`, style `reka-nova`, base color neutral, Reka UI primitives, `@lucide/vue` icons). Components live in `src/components/ui/<name>/` and are CLI-generated — add/update them with `npx shadcn-vue@latest add <name>` (`--overwrite` to refresh) rather than hand-editing. `cn()` is in `src/lib/utils.ts`. Theme tokens (CSS variables, light + `.dark`) are in `src/assets/main.css`; use semantic utilities (`bg-card`, `text-muted-foreground`, …) instead of raw colors and no `<style scoped>`.
- Dark mode: `useColorMode` from `@vueuse/core` (`src/components/ModeToggle.vue`) toggles the `dark` class on `<html>`; an inline script in `index.html` applies the saved choice before mount to avoid a flash. Font is self-hosted Geist (`@fontsource-variable/geist`).
- `shadcn-vue` (the CLI) is a devDependency only because `main.css` imports `shadcn-vue/tailwind.css`; its `npm audit` findings are CLI-only and never reach the bundle.
- Router uses `createWebHistory(import.meta.env.BASE_URL)`; non-home routes are lazy-loaded.
- TypeScript is split via project references: `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config), so `vue-tsc --build` checks both.
- Docker: `frontend/Dockerfile` is a multi-stage production build (`npm ci` + `npm run build`, then nginx serving `dist/` with `nginx.conf`, which also proxies `/api` to the backend); it's what `docker-compose.yml` builds (port 80). `backend/Dockerfile` is also multi-stage (`npm ci` + `npm run build` + `npm prune --omit=dev`, then `node dist/main.js` as user `node`); the backend has no published port — only nginx reaches it on the compose network. All services use `restart: unless-stopped`; the backend has `init: true` for signal forwarding.
- Database: `src/db/schema.ts` (tables + `$infer*` types), `relations.ts` (`defineRelations`, enables `db.query.*` with `with`), `database.ts` (`Database` type for `@InjectDrizzle()`). `AppModule` registers `ConfigModule.forRoot({ isGlobal: true })` and `DrizzleModule.forRootAsync` (reads `DATABASE_URL` via `ConfigService.getOrThrow`); `main.ts` calls `enableShutdownHooks()` so the pool closes on SIGTERM. Unit tests mock the db with `{ provide: getDrizzleToken(), useValue: ... }`.
- Validation: zod via Nest 12's native Standard Schema support — global `StandardSchemaValidationPipe` registered as `APP_PIPE` in `AppModule` (so e2e tests get it too), schemas passed in the decorator (`@Body({ schema })`, `@Param('id', { schema })`, `@Query('months', { schema })`); params without a schema are not validated. Schemas live next to the module (`users/users.schemas.ts`, types via `z.infer`); use `z.strictObject` to reject unknown keys and `z.coerce` for route/query params. Postgres errors arrive wrapped in drizzle's `DrizzleQueryError` with pg's `DatabaseError` as `cause` — `UsersService.remove` maps FK violation `23503` (user has orders/photos) to 409.
- Migrations: generated SQL lives in `backend/drizzle/` (commit it; the Dockerfile copies it into the image). In the container, the backend `CMD` is `sh -c "node dist/db/migrate.js && exec node dist/main.js"` (drizzle-orm's migrator, since drizzle-kit is pruned): migrations run on every start, a failure exits the container (restart retries) so the API never runs on a stale schema, and `exec` keeps node as the main process for signals. `backend` waits for postgres with `service_healthy` and has its own healthcheck (`wget` on `/health`; the frontend deliberately doesn't wait for it); `DATABASE_URL` is built from the root `.env` `POSTGRES_*` vars. If the backend is ever scaled to multiple replicas, move migrations back to a one-shot step.

## Sales report (baseline for later Redis/queue work)

Deliberately plain: no polling, queue, progress or background jobs — those will be added by hand later on top of this.

- `ReportsModule`: `GET /reports/sales?months=` (1–24, default 12) runs 5 aggregate queries over `orders`/`products`/`users` and returns the whole report when done (~0.5–1 s on the 1M-row seed). Stateless: nothing is stored.
- Tables `products` and `orders` in `src/db/schema.ts`; populate with `npm run db:seed` (idempotent; `SEED_ORDERS` / `SEED_USERS` override the sizes). `orders` has no index on `created_at` on purpose, so the report scans the table.
