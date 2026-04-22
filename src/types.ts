export type SseStartEvent = { type: "start"; endpoint: string };
export type SseTextEvent = { type: "text"; text: string };
export type SseThinkingEvent = { type: "thinking"; text: string };
export type SseToolUseEvent = { type: "tool_use"; name: string; input: unknown };
import type { OutputType } from "./schema";

export type SseDoneEvent = {
  type: "done";
  session_id: string;
  subtype: string;
  duration_ms: number;
  duration_api_ms: number;
  total_cost_usd: number;
  result?: string;
  structured_output?: OutputType;
};
export type SseErrorEvent = { type: "error"; message: string };

export type SseEvent =
  | SseStartEvent
  | SseTextEvent
  | SseThinkingEvent
  | SseToolUseEvent
  | SseDoneEvent
  | SseErrorEvent;
