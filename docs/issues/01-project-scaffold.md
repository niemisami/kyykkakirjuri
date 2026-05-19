# Issue 1: Project scaffold

## Parent

[PRD: Kyykkakirjuri](../prd-kyykkakirjuri.md)

## What to build

Bootstrap the full development environment so every subsequent slice can start building immediately. This slice produces a runnable app shell with all tooling configured but no domain logic.

- **Package manager**: pnpm
- **Framework**: Vite + React + TypeScript
- **Styles**: Tailwind CSS + shadcn/ui (component primitives)
- **State**: @tanstack/store
- **Routing**: @tanstack/router (single route `/` for now)
- **Validation**: Zod
- **Tests**: Vitest + @testing-library/react
- **UI language**: Finnish — all visible strings are hardcoded Finnish. Code is written in English. Finnish terms are only used in code when no English equivalent exists (e.g. `akka`, `pappi`, `kyykkä`, `karttu`).

The app shell renders a minimal placeholder page so the dev server and test runner can be verified end-to-end. No domain logic yet.

## Acceptance criteria

- [x] `pnpm dev` starts the Vite dev server without errors
- [x] `pnpm test` runs Vitest and passes (at least one smoke test)
- [x] `pnpm build` produces a production bundle without errors
- [x] Tailwind utility classes apply correctly in the browser
- [x] A shadcn/ui primitive (e.g. Button) renders without errors
- [x] @tanstack/store and @tanstack/router are importable
- [x] Zod is importable and a trivial schema parses successfully
- [x] The single route `/` renders the placeholder page on a mobile viewport

## Blocked by

None — can start immediately.
