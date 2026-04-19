# Electr

Walking skeleton for an Electron app with an embedded Express server and a React UI.

## Stack

| Layer     | Technology                                                                  |
| --------- | --------------------------------------------------------------------------- |
| Shell     | [Electron](https://www.electronjs.org/) 29                                  |
| Backend   | [Express](https://expressjs.com/) 4 (runs inside the Electron main process) |
| Frontend  | [React](https://react.dev/) 18, bundled by [Vite](https://vitejs.dev/) 5    |
| Packaging | [electron-builder](https://www.electron.build/) 24                          |

## Architecture

```
Electron main process
├── electron/server.js   Express server on :3001
└── electron/main.js     BrowserWindow → React UI

React renderer (src/)
└── fetches http://localhost:3001/*
```

The Express server starts inside the main process before the window opens. The React app communicates with it over localhost — no IPC required for basic API calls.

## Commands

```bash
npm run dev        # Start Vite dev server + Electron (hot reload)
npm run build      # Bundle React → dist/
npm run package    # Package Electron app → release/ (requires dist/)
npm run dist       # build + package in one shot
npm start          # Launch Electron against an existing dist/ (no packaging)
```

## Development

```bash
npm install
npm run dev
```

DevTools open automatically in dev mode. The Vite dev server runs on `:5173`; the Express server on `:3001`.

## Standards

- Conventional Commits

## Building a distributable

```bash
npm run dist
```

Output:

```
release/
├── Electr-x.x.x-arm64.dmg   # Installer — drag to /Applications
└── mac-arm64/
    └── Electr.app            # Portable app — runs directly
```

Re-run `npm run dist` whenever you want a fresh build. Each run overwrites the previous `release/` output.

## Adding API endpoints

Edit [electron/server.js](electron/server.js). Example:

```js
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});
```

Then call it from React:

```js
const data = await fetch("http://localhost:3001/ping").then((r) => r.json());
```

## Project structure

```
electr/
├── electron/
│   ├── main.js       Electron entry — opens window, starts server
│   └── server.js     Express server
├── src/
│   ├── main.jsx      React entry point
│   └── App.jsx       Root component
├── index.html        Vite HTML template
├── vite.config.js
└── package.json      Also holds electron-builder config ("build" field)
```
