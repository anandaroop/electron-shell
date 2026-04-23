import { Flex, Text } from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SseEvent } from "../types";

interface EventLogProps {
  statusRef: React.RefObject<HTMLDivElement | null>;
  events: SseEvent[];
}

export const EventLog: React.FC<EventLogProps> = (props) => {
  const { statusRef, events } = props;
  return (
    <Flex
      ref={statusRef}
      direction="column"
      p="4"
      gap="3"
      style={{
        overflowY: "scroll",
        flexGrow: 1,
        background: "var(--gray-a2)",
        borderRadius: "var(--radius-2)",
      }}
    >
      {events.map((event, i) => (
        <EventView key={i} event={event} />
      ))}
    </Flex>
  );
};

function EventView({ event }: { event: SseEvent }) {
  if (event.type === "start") return null;

  if (event.type === "thinking")
    return (
      <Text size="2" style={{ whiteSpace: "pre-wrap", opacity: 0.5, fontStyle: "italic" }}>
        {event.text}
      </Text>
    );

  if (event.type === "text")
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.text}</ReactMarkdown>;

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
