import { Box, Button, Flex, Grid, Separator, Spinner, Text, TextField } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import type { OutputType } from "../schema";
import type { SseEvent } from "../types";

const API = import.meta.env.VITE_API_URL as string;

export default function App() {
  const [prompt, setPrompt] = useState("Give me the haiku");
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [structuredOutput, setStructuredOutput] = useState<OutputType | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statusRef.current) {
      statusRef.current.scrollTop = statusRef.current.scrollHeight;
    }
  }, [events]);

  async function fetchGeneration() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            const event = JSON.parse(line.slice(6)) as SseEvent;
            setEvents((prev) => [...prev, event]);
            if (event.type === "done" && event.structured_output !== undefined) {
              setStructuredOutput(event.structured_output);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setEvents((prev) => [...prev, { type: "error", message }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box height="100vh" overflow="hidden" p="6">
      <Flex direction="column" gap="4" height="100%">
        <Text size="6" weight="bold">
          Assistant
        </Text>
        <Separator size="4" />
        <Grid columns="3" gap="6" width="auto" style={{ flexGrow: 1, overflow: "hidden" }}>
          {/* Left column */}
          <Flex direction="column" gap="4">
            <Text weight="bold">Prompt</Text>
            <TextField.Root
              placeholder="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <Button
              onClick={fetchGeneration}
              disabled={isLoading}
              mt="4"
              style={{ padding: "0.5rem 1.25rem", fontSize: "1rem", cursor: "pointer" }}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Processing…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Flex>

          {/* Center column */}
          <Flex direction="column" gap="4" height="100%" overflow="hidden">
            <Text weight="bold">Result</Text>
            <Box style={{ overflowY: "scroll", flexGrow: 1 }}>
              {structuredOutput !== null && (
                <Box
                  p="3"
                  style={{
                    background: "var(--gray-a3)",
                    borderRadius: "var(--radius-2)",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {JSON.stringify(structuredOutput, null, 2)}
                </Box>
              )}
            </Box>
          </Flex>

          {/* Right column */}
          <Flex direction="column" gap="4" height="100%" overflow="hidden">
            <Text weight="bold">Agent log</Text>
            <Flex
              ref={statusRef}
              direction="column"
              gap="3"
              style={{ overflowY: "scroll", flexGrow: 1 }}
            >
              {events.map((event, i) => (
                <EventView key={i} event={event} />
              ))}
            </Flex>
          </Flex>
        </Grid>
      </Flex>
    </Box>
  );
}

function EventView({ event }: { event: SseEvent }) {
  if (event.type === "start") return null;

  if (event.type === "thinking")
    return (
      <Text style={{ whiteSpace: "pre-wrap", opacity: 0.5, fontStyle: "italic" }}>
        {event.text}
      </Text>
    );

  if (event.type === "text") return <Text style={{ whiteSpace: "pre-wrap" }}>{event.text}</Text>;

  if (event.type === "tool_use")
    return (
      <Flex
        direction="column"
        gap="1"
        style={{ opacity: 0.6, fontFamily: "monospace", fontSize: "0.85rem" }}
      >
        <Text>⚙ {event.name}</Text>
        <ToolCallDetail name={event.name} input={event.input as Record<string, unknown>} />
      </Flex>
    );

  if (event.type === "done")
    return (
      <Text size="1" color="indigo">
        {((event.duration_ms ?? 0) / 1000).toFixed(1)}s · ${(event.total_cost_usd ?? 0).toFixed(4)}
      </Text>
    );

  if (event.type === "error") return <Text style={{ color: "red" }}>Error: {event.message}</Text>;
}

function ToolCallDetail({ name, input }: { name: string; input: Record<string, unknown> }) {
  if (name === "WebFetch" && typeof input.url === "string")
    return <Text style={{ paddingLeft: "1rem", opacity: 0.8 }}>{input.url}</Text>;

  if (name === "Skill" && typeof input.skill === "string")
    return <Text style={{ paddingLeft: "1rem", opacity: 0.8 }}>{input.skill}</Text>;

  if (name === "TodoWrite" && Array.isArray(input.todos))
    return (
      <Flex direction="column" style={{ paddingLeft: "1rem" }}>
        {(input.todos as Array<{ content: string; status?: string }>).map((todo, idx) => (
          <Text key={idx}>
            {todo.status === "completed" ? "✓" : "·"} {todo.content}
          </Text>
        ))}
      </Flex>
    );

  if (name === "StructuredOutput")
    return (
      <Text style={{ paddingLeft: "1rem", opacity: 0.8 }}>
        {JSON.stringify(input).slice(0, 1000)}…
      </Text>
    );

  return null;
}
