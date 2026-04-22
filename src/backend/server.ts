import express, { Request, Response } from "express";
import cors from "cors";
import { CLAUDE_CWD, getQueryFn } from "./query";
import { SYSTEM_PROMPT } from "../prompt";
import { HAIKU_SCHEMA } from "../schema";

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/bio", async (_req: Request, res: Response) => {
  console.log("Starting /bio request");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const query = await getQueryFn();

  try {
    for await (const message of query({
      prompt: `Give me the haiku`,
      options: {
        cwd: CLAUDE_CWD,
        systemPrompt: SYSTEM_PROMPT,
        settingSources: ["project"],
        allowedTools: ["ToolSearch", "TodoWrite", "WebSearch", "WebFetch", "Skill", "Task"],
        outputFormat: {
          type: "json_schema",
          schema: HAIKU_SCHEMA,
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
