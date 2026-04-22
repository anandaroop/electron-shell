import express, { Request, Response } from "express";
import cors from "cors";
import { createRequire } from "module";
import type * as ClaudeAgentSdk from "@anthropic-ai/claude-agent-sdk" with {
  "resolution-mode": "import",
};
import { schema } from "../schema";
import { systemPrompt } from "../prompt";
import { Laminar } from "@lmnr-ai/lmnr";

// maybe configure Laminar
if (process.env.LMNR_PROJECT_API_KEY) {
  console.log("🟢 Laminar observability is enabled");
  Laminar.initialize({
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
    baseUrl: process.env.LMNR_BASE_URL,
    httpPort: parseInt(process.env.LMNR_HTTP_PORT!),
    grpcPort: parseInt(process.env.LMNR_GRPC_PORT!),
  });
} else {
  console.log("🔴 Laminar observability is disabled");
}

function resolveUnpacked(pkg: string): string {
  const _require = createRequire(__filename);
  return _require.resolve(pkg).replace(/app\.asar([/\\])/g, "app.asar.unpacked$1");
}

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/bio", async (_req: Request, res: Response) => {
  console.log("Starting /bio request");

  // Static import of the Claude Agent SDK would have been the typical:
  // import { query } from "@anthropic-ai/claude-agent-sdk"
  //
  // Dynamic import with runtime path needed because asar-unpacked native modules
  // can't be required by name. The `as typeof` cast restores types dynamic
  // import() can't infer.
  const { query: origQuery } = (await import(
    resolveUnpacked("@anthropic-ai/claude-agent-sdk")
  )) as typeof ClaudeAgentSdk;

  // maybe instrument the query with Laminar
  const query = process.env.LMNR_PROJECT_API_KEY
    ? Laminar.wrapClaudeAgentQuery(origQuery)
    : origQuery;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    for await (const message of query({
      prompt: `Give me the haiku`,
      options: {
        systemPrompt,
        allowedTools: ["TodoWrite", "WebSearch", "WebFetch"],
        outputFormat: {
          type: "json_schema",
          schema,
        },
      },
    })) {
      console.log(`Received ${message.type} message`);
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            const event = `data: ${JSON.stringify({ type: "text", text: block.text })}\n\n`;
            console.log("Sending event:", event);
            res.write(event);
          } else if ("name" in block) {
            const input = block.input as Record<string, unknown>;
            const url = block.name === "WebFetch" ? (input.url as string) : undefined;
            const event = `data: ${JSON.stringify({ type: "tool", name: block.name, url })}\n\n`;
            console.log("Sending event:", event);
            res.write(event);
          }
        }
      } else if (message.type === "result") {
        const event = `data: ${JSON.stringify({ type: "done", subtype: message.subtype })}\n\n`;
        console.log("Sending event:", event);
        res.write(event);
      }
    }
  } catch (err) {
    console.error("query error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`);
  }

  res.end();
});
