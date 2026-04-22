import { createRequire } from "module";
import { app as electronApp } from "electron";
import path from "path";
import type * as ClaudeAgentSdk from "@anthropic-ai/claude-agent-sdk" with {
  "resolution-mode": "import",
};
import { Laminar } from "@lmnr-ai/lmnr";

if (process.env.LMNR_PROJECT_API_KEY) {
  Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
    baseUrl: process.env.LMNR_BASE_URL,
    httpPort: parseInt(process.env.LMNR_HTTP_PORT!),
    grpcPort: parseInt(process.env.LMNR_GRPC_PORT!),
  });
  console.log("🟢 Laminar observability is enabled");
} else {
  console.log("🔴 Laminar observability is disabled");
}

/**
 * Location of .claude/ contents within the Electron bundle,
 * so that Claude Agent SDK can access them.
 */
export const CLAUDE_CWD = electronApp.isPackaged
  ? process.resourcesPath
  : path.resolve(__dirname, "../..");

/**
 * Returns a ready-to-use Claude Agent SDK Query function.
 *
 * This function handles:
 * - the Electron-specific needs for importing the Claude Agent SDK
 * - preserving TS types for intellisense
 * - optionally wrapping the query in Laminar observability, if the right env vars are present
 *
 * @returns ClaudeAgentSdk.Query
 */
export async function getQueryFn() {
  // Dynamic import needed because asar-unpacked native modules can't be required
  // by name. The `as typeof` cast restores types that dynamic import() can't infer.
  const { query: origQuery } = (await import(
    resolveUnpacked("@anthropic-ai/claude-agent-sdk")
  )) as typeof ClaudeAgentSdk;

  return process.env.LMNR_PROJECT_API_KEY ? Laminar.wrapClaudeAgentQuery(origQuery) : origQuery;
}

function resolveUnpacked(pkg: string): string {
  const _require = createRequire(__filename);
  return _require.resolve(pkg).replace(/app\.asar([/\\])/g, "app.asar.unpacked$1");
}
