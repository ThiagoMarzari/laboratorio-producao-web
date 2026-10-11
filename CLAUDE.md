# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Monorepo-style layout (git repo, branch `main`; root `.gitignore` excludes `.env` — `.env.example` is the template) with two top-level dirs:

- `backend/` — freshly scaffolded NestJS 12 app (`nest new`, strict mode). Only the default `AppModule`/`AppController`/`AppService` (GET `/` → "Hello World!").
- `frontend/` — Vue 3 + TypeScript + Vite app styled with Tailwind CSS v4 + shadcn-vue. Routes: `/` (`HomeView`, with `HealthStatus` polling `/api/health`) and `/deploy` (`DeployView`).

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

- Vite config registers `@vitejs/plugin-vue`, `vite-plugin-vue-devtools` and `@tailwindcss/vite`; `@` aliases `frontend/src` (also declared in root `tsconfig.json` `paths` for the shadcn-vue CLI — no `baseUrl`, it's deprecated in TS 6). `server.proxy` maps `/api/*` to `localhost:3000` in dev, mirroring nginx in prod.
- UI: shadcn-vue (`frontend/components.json`, style `reka-nova`, base color neutral, Reka UI primitives, `@lucide/vue` icons). Components live in `src/components/ui/<name>/` and are CLI-generated — add/update them with `npx shadcn-vue@latest add <name>` (`--overwrite` to refresh) rather than hand-editing. `cn()` is in `src/lib/utils.ts`. Theme tokens (CSS variables, light + `.dark`) are in `src/assets/main.css`; use semantic utilities (`bg-card`, `text-muted-foreground`, …) instead of raw colors and no `<style scoped>`.
- Dark mode: `useColorMode` from `@vueuse/core` (`src/components/ModeToggle.vue`) toggles the `dark` class on `<html>`; an inline script in `index.html` applies the saved choice before mount to avoid a flash. Font is self-hosted Geist (`@fontsource-variable/geist`).
- `shadcn-vue` (the CLI) is a devDependency only because `main.css` imports `shadcn-vue/tailwind.css`; its `npm audit` findings are CLI-only and never reach the bundle.
- Router uses `createWebHistory(import.meta.env.BASE_URL)`; non-home routes are lazy-loaded.
- TypeScript is split via project references: `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config), so `vue-tsc --build` checks both.
- Docker: `frontend/Dockerfile` is a multi-stage production build (`npm ci` + `npm run build`, then nginx serving `dist/` with `nginx.conf`, which also proxies `/api` to the backend); it's what `docker-compose.yml` builds (port 80).
