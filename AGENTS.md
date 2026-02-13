# Repository Guidelines

## Project Structure & Module Organization
This repository is currently specification-first: `CALUDE.md` contains the product and technical blueprint for a React + TypeScript + Vite Minesweeper PWA.

When implementing, follow the planned structure in `CALUDE.md`:
- `src/core`: board generation, mine placement, flood fill, win/loss checks.
- `src/context`: global game state (`Context + useReducer`).
- `src/components/*`: UI modules such as `Board`, `Cell`, `HUD`, `Modal`.
- `src/hooks`: reusable game and timer hooks.
- `src/theme`: theme tokens/styles.
- `public/icons`: PWA icons.
- `.github/workflows`: CI/CD pipelines.

## Build, Test, and Development Commands
After scaffolding the app (Vite React-TS), use:
- `yarn install`: install dependencies.
- `yarn dev`: start local dev server.
- `yarn build`: type-check and build production assets into `dist/`.
- `yarn preview`: serve the built app locally.
- `yarn test`: run unit/integration tests (add this script when test setup is introduced).

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts`/`.tsx`) with 2-space indentation.
- Components: PascalCase files and exports (example: `DifficultySelector.tsx`).
- Functions/variables: camelCase (example: `calculateAdjacentCounts`).
- Types/interfaces: PascalCase (`Cell`, `GameState`).
- Keep core game logic pure in `src/core`; keep UI side effects in components/hooks.
- Use CSS Modules for component-scoped styles (example: `Cell.module.css`).

## Testing Guidelines
Preferred stack: Vitest + React Testing Library.
- Test files: `*.test.ts` or `*.test.tsx`, colocated or in `src/__tests__/`.
- Prioritize coverage for rules in `CALUDE.md`: first-click safety, flood fill, flag logic, win/loss detection, AI move selection.
- Add regression tests for every bug fix in core logic.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so use Conventional Commits by default:
- `feat: add probabilistic AI stepper`
- `fix: prevent opening flagged cells`

For pull requests:
- Include a concise summary, scope, and test evidence.
- Link related issues.
- Attach screenshots/GIFs for UI changes (board, HUD, modals, themes).
- Note PWA-impacting changes (manifest, caching, offline behavior).
