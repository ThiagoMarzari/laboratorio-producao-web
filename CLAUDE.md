# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Monorepo-style layout (git repo, branch `main`; root `.gitignore` excludes `.env` — `.env.example` is the template) with two top-level dirs:

- `backend/` — freshly scaffolded NestJS 12 app (`nest new`, strict mode). Only the default `AppModule`/`AppController`/`AppService` (GET `/` → "Hello World!").
- `frontend/` — freshly scaffolded Vue 3 + TypeScript + Vite app (create-vue template). `HelloWorld`, `TheWelcome`, `WelcomeItem`, and `components/icons/*` are untouched template boilerplate; `HomeView`/`AboutView` and the two routes in `src/router/index.ts` are still the template defaults.

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

pnpm; ESM project (`"type": "module"`, relative imports need `.js` suffix).

```sh
pnpm install
pnpm start:dev      # nest start --watch, port 3000 (or $PORT)
pnpm build          # nest build -> dist/
pnpm start:prod     # node dist/main
pnpm test           # vitest; pnpm test:e2e for test/*.e2e-spec.ts
pnpm lint           # oxlint
```

## Architecture notes

- Vite config registers `@vitejs/plugin-vue` and `vite-plugin-vue-devtools`; `@` aliases `frontend/src`.
- Router uses `createWebHistory(import.meta.env.BASE_URL)`; non-home routes are lazy-loaded.
- TypeScript is split via project references: `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config), so `vue-tsc --build` checks both.
- Docker: `frontend/Dockerfile` runs the dev server (`npm ci` + `npm run dev -- --host 0.0.0.0`) on 5173; it's what `docker-compose.yml` builds. `nginx.conf` is for a future production static build served by nginx.
