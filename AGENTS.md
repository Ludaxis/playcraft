# Repository Guidelines

Reference for contributing to PlayCraft. Keep changes small and consistent with the patterns below.

## Project Structure & Module Organization
- `apps/web`: React + Vite app. Feature logic in `src/lib`, UI in `src/components`, routes in `src/pages`, styles/tokens in `src/styles`, tests in `__tests__` or `*.test.ts(x)`, static assets in `public`.
- `apps/docs`: VitePress docs under `docs/` with its own dev/build scripts.
- `supabase`: Functions (`functions/generate-playcraft`, `functions/process-generation`) and migrations; Supabase CLI needed for deploys.
- Root configs (`package.json`, `.prettierrc`, `pnpm-workspace.yaml`) share scripts, formatting, and lint rules across workspaces.

## Build, Test, and Development Commands
- `pnpm install`: Install workspace dependencies.
- `pnpm dev` / `pnpm dev:docs`: Run web or docs locally.
- `pnpm build` / `pnpm build:all`: Build the web app or all packages; `pnpm --filter @playcraft/web preview` to inspect a build.
- `pnpm lint`, `pnpm lint:fix`, `pnpm typecheck`: ESLint + TypeScript; auto-fix with `lint:fix`.
- `pnpm test`, `pnpm test:coverage`: Vitest suites for the web app. Storybook: `pnpm --filter @playcraft/web storybook`.
- `pnpm format` / `pnpm format:check`: Prettier (with Tailwind class sorting).

## Coding Style & Naming Conventions
- TypeScript/ESM; prefer functional React components. Hooks start with `use`, components in PascalCase files, utilities in camelCase.
- Prettier settings: 2-space indent, semicolons, single quotes, 100-char line width, trailing commas (`es5`), LF endings.
- ESLint recommended + React Hooks rules; keep exports intentional and type explicit on public utilities.
- Tailwind classes are auto-sorted; keep class lists declarative.

## Testing Guidelines
- Frameworks: Vitest + @testing-library/react; setup lives in `apps/web/src/test/setup.ts`.
- Location: co-locate tests in `__tests__` or `*.test.ts(x)` next to code; mock network/Supabase calls.
- Run `pnpm test` before PRs; target a file with `pnpm test --run tests/lib/projectService.test.ts`; use `pnpm test:coverage` when guarding regressions.

## Commit & Pull Request Guidelines
- Conventional commits (`feat:`, `fix:`, etc.) as seen in history; keep subjects short and imperative.
- Pre-flight: `pnpm lint && pnpm typecheck && pnpm test` (and `pnpm build` when changing build/runtime paths).
- PRs: clear summary, linked issue/task, screenshots for UI changes, notes on env/config updates, and doc updates when behavior changes.
- Prefer focused diffs; split unrelated refactors into separate PRs.

## Security & Configuration
- Do not commit secrets. Copy `apps/web/.env.example` to `.env` and add Supabase keys locally; secure keys in CI.
- Deploy functions with `supabase functions deploy generate-playcraft`; keep `supabase/migrations` updated after schema changes.
- Avoid committing `dist` or `storybook-static` artifacts.
- New workspace schema: after pulling, run `supabase db push` to apply workspace tables/policies.
