# ElectronShell

A template for building Claude Agent SDK apps that can be packaged and distributed as desktop apps.

<img width="5120" height="2880" alt="desktop3" src="https://github.com/user-attachments/assets/8ef7932d-2d2e-4a3d-9c01-123b0facde7c" />

_Example app developed with this — see [artist-bio](https://github.com/anandaroop/electron-shell/tree/artist-bio) branch._

This is meant to provide a low-stakes, low-effort way to get modest agentic apps into the hands of colleagues, without the burden of deployment, monitoring etc. Those strengths are also its weaknesses. This is not a solution for critical work, but may be handy for prototyping agentic workflows.

Observability is absent for now, but the project is already prepped for Laminar observability, which can be enabled via env vars.

The annoying boilerplate is basically done, so that what remains for the developer is a handful of customization points:

- **Instructions**: Update the system prompt in `src/prompt.ts`
- **Output schema**: Update the JSON schema for the desired final structured output in `src/schema.ts`
- **Skills**: Add any needed agent skills under `.claude/skills/` — the Claude Agent SDK will have access to them
- **Query**: Update the query call to Claude Agent SDK in `src/backend/server.ts` to re/configure all of the above
- **UI**: Modify the UI to suit your required inputs and outputs at `src/frontend/App.tsx`

## Commands

```bash
npm run dev          # Start dev mode: compiles main process + Vite HMR + Electron
npm run build        # Compile main process (tsc) + bundle renderer (vite)
npm run dist         # build + package into release/
npm run typecheck    # Type-check both renderer and main process without emitting
npm run lint         # ESLint across src/frontend, src/backend, vite.config.ts
npm run format       # Prettier across src/
npm test             # Run all Vitest tests once
npm run test:watch   # Run tests in watch mode
```

## Stack

- [Electron](https://www.electronjs.org/) (shell)
- [Express](https://expressjs.com/) (runs inside the Electron main process)
- [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) (streamed via SSE)
- [React](https://react.dev/), bundled by [Vite](https://vitejs.dev/)
- [Radix UI Themes](https://www.radix-ui.com/themes)
- [TypeScript](https://www.typescriptlang.org/)
- [electron-builder](https://www.electron.build/) (packaging)

## Architecture

<img width="1704" height="514" alt="electron-shell" src="https://github.com/user-attachments/assets/1227e7e2-48de-4edb-9ac7-b4d9698b3fc8" /><br />

Three distinct layers:

**Main process** ([src/backend/main.ts](src/backend/main.ts)) — Node.js / Electron entry point. Loads `.env`, changes `process.cwd()` to `userData` (avoids macOS TCC prompts), starts Express on port 3001, then opens a `BrowserWindow` pointing to either the Vite dev server (`:5173`) or `dist/index.html`.

**Express server** ([src/backend/server.ts](src/backend/server.ts)) — A single `POST /generate` endpoint that invokes the Claude Agent SDK and streams results back to the renderer as Server-Sent Events (SSE). The system prompt lives in [src/prompt.ts](src/prompt.ts); the structured output schema (Zod → JSON Schema) lives in [src/schema.ts](src/schema.ts).

**React renderer** ([src/frontend/App.tsx](src/frontend/App.tsx)) — Fetches `/generate`, consumes the SSE stream, and renders thinking text, tool-use calls, structured output, and performance metrics (duration, cost). Uses Radix UI Themes (dark mode).

**No IPC.** Communication between renderer and backend is plain HTTP to `localhost:3001`. The `VITE_API_URL` env var is injected at build time so the renderer knows the URL.

## Claude Agent SDK integration

[src/backend/query.ts](src/backend/query.ts) dynamically imports `@anthropic-ai/claude-agent-sdk` at runtime to work around Electron's `.asar` packaging — native modules must live in `app.asar.unpacked/` (configured in `package.json`'s `build.asarUnpack` field). The `resolveUnpacked()` helper redirects the import path when running from a packaged build.

SSE event types are defined in [src/types.ts](src/types.ts) and mirror `BetaContentBlock` from the Anthropic SDK.

Optional Laminar observability is enabled when `LMNR_PROJECT_API_KEY` is set in `.env`.

## TypeScript setup

Two separate `tsconfig` files for the two environments:

- `tsconfig.json` — renderer (Vite, bundler module resolution, targets browser)
- `tsconfig.electron.json` — main process (Node16 module resolution, outputs to `out/`)

## Testing

- Backend tests use **supertest** ([src/backend/server.test.ts](src/backend/server.test.ts))
- Frontend tests use **React Testing Library** ([src/frontend/App.test.tsx](src/frontend/App.test.tsx))
- Vitest uses `jsdom` for renderer tests and `node` for backend tests (controlled per-file via `@vitest-environment` docblock)

## Code quality

- Git style is Conventional Commits
- Linting and formatting are enforced at commit time via [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged): staged `.ts`/`.tsx` files are auto-fixed by ESLint and formatted by Prettier before every commit.

## Custom skills

The agent has access to the project-local skills under `./.claude/skills/`. Agent logic can be extracted and bundled up in this way.

## Environment

Requires a `.env` file at the project root:

```
ANTHROPIC_API_KEY=...
EXPRESS_PORT=3001          # optional
LMNR_PROJECT_API_KEY=...   # optional, enables Laminar tracing
```

The `scripts/afterPack.cjs` hook copies `.env` into the packaged `.app` bundle at build time.

## Building a distributable

```bash
npm run dist
```

Output:

```
release/
├── ElectronShell-x.x.x-arm64.dmg   # Installer — drag to /Applications
└── mac-arm64/
    └── ElectronShell.app            # Portable app — runs directly
```

Re-run `npm run dist` whenever you want a fresh build. Each run overwrites the previous `release/` output.

## Debugging

**Packaged app not working?** Run it directly from Terminal to see log output immediately:

```bash
release/mac-arm64/ElectronShell.app/Contents/MacOS/ElectronShell
```
