import express, { Request, Response } from "express";
import cors from "cors";
import { createRequire } from "module";

const _require = createRequire(__filename);

function resolveUnpacked(pkg: string): string {
  return _require.resolve(pkg).replace(/app\.asar([/\\])/g, "app.asar.unpacked$1");
}

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});

app.post("/bio", async (_req: Request, res: Response) => {
  console.log("Starting /bio request");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const { query } = await import(resolveUnpacked("@anthropic-ai/claude-agent-sdk"));
  try {
    for await (const message of query({
      prompt: `
    You will search for the latest NBA Playoffs news and summarize it in haiku form.

    - You must use a Todo list
    - You must use WebFetch to get at least 1 full page result
    - Return 1-3 haiku stanzas
    `,
      options: {
        allowedTools: ["TodoWrite", "WebSearch", "WebFetch"],
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
