import { Box, Button, Flex, Grid, Skeleton, Spinner, Text } from "@radix-ui/themes";
import { useState } from "react";
import type { SseEvent } from "../types";

const API = import.meta.env.VITE_API_URL as string;

export default function App() {
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [loading, setLoading] = useState(false);

  async function ping() {
    setLoading(true);
    setEvents([]);
    try {
      const res = await fetch(`${API}/bio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            const event = JSON.parse(line.slice(6)) as SseEvent;
            console.log("Received event:", event);
            setEvents((prev) => [...prev, event]);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setEvents((prev) => [...prev, { type: "error", message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box height="100vh" overflow="hidden" p="6">
      <Grid columns="2" gap="6" width="auto" height="100%">
        {/* left column */}

        <Flex direction="column" gap="5">
          <Button
            onClick={ping}
            disabled={loading}
            style={{ padding: "0.5rem 1.25rem", fontSize: "1rem", cursor: "pointer" }}
          >
            {loading ? (
              <>
                <Spinner />
                Processing…
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </Flex>

        {/* right column */}

        <Flex direction="column" gap="5" height="100%" overflow="scroll">
          {loading && events.length === 0 ? (
            <Skeleton>
              <Box height="100px" />
            </Skeleton>
          ) : (
            events.map((event, i) => <SseEventView key={i} event={event} />)
          )}
        </Flex>
      </Grid>
    </Box>
  );
}

function SseEventView({ event }: { event: SseEvent }) {
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
        <ToolDetail name={event.name} input={event.input} />
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

function ToolDetail({ name, input }: { name: string; input: unknown }) {
  const i = input as Record<string, unknown>;

  if (name === "WebFetch" && typeof i.url === "string")
    return <Text style={{ paddingLeft: "1rem", opacity: 0.8 }}>{i.url}</Text>;

  if (name === "Skill" && typeof i.skill === "string")
    return <Text style={{ paddingLeft: "1rem", opacity: 0.8 }}>{i.skill}</Text>;

  if (name === "TodoWrite" && Array.isArray(i.todos))
    return (
      <Flex direction="column" style={{ paddingLeft: "1rem" }}>
        {(i.todos as Array<{ content: string; status?: string }>).map((todo, idx) => (
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
