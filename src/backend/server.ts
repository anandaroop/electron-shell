import express, { Request, Response } from "express";
import cors from "cors";
import { CLAUDE_CWD, getQueryFn } from "./query";
import { SYSTEM_PROMPT } from "../prompt";
import { HAIKU_SCHEMA } from "../schema";
import type { BetaContentBlock } from "@anthropic-ai/sdk/resources/beta";
import pick from "lodash/pick";
import type {
  SseDoneEvent,
  SseEvent,
  SseTextEvent,
  SseThinkingEvent,
  SseToolUseEvent,
} from "../types";

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  console.log("Starting /generate request");
  sendSseEvent({ type: "start", endpoint: "generate" }, res);

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
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          const event = createSseEventFromAssistantMessageBlock(block);
          sendSseEvent(event, res);
        }
      }

      if (message.type === "user") {
        // ignore: usually a non-user-facing tool_use_result
      }

      if (message.type === "result") {
        const event = createSseEventFromResultMessage(message);
        sendSseEvent(event, res);
      }
    }
  } catch (err) {
    console.error("query error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`);
  }

  res.end();
});

function createSseEventFromAssistantMessageBlock(
  block: BetaContentBlock
): SseTextEvent | SseThinkingEvent | SseToolUseEvent | null {
  if (block.type === "text") {
    return { type: "text", text: block.text };
  }

  if (block.type === "thinking") {
    return { type: "thinking", text: block.thinking };
  }

  if (block.type === "tool_use") {
    return { type: "tool_use", name: block.name, input: block.input };
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSseEventFromResultMessage(message: any): SseDoneEvent {
  return {
    type: "done" as const,
    ...pick(message, [
      "session_id",
      "subtype",
      "duration_ms",
      "duration_api_ms",
      "total_cost_usd",
      "result",
      "structured_output",
    ]),
  };
}

function sendSseEvent(event: SseEvent | null, res: Response) {
  if (!event) return;

  console.log("Sending event:", event);
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}
