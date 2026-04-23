import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Separator,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import type { OutputType } from "../schema";
import type { SseEvent } from "../types";
import { Result } from "./Result";
import { ResultPlaceholder } from "./ResultPlaceholder";
import { EventLog } from "./EventLog";
import { TodoPanel, type TodoItem } from "./TodoPanel";

const API = import.meta.env.VITE_API_URL as string;

export default function App() {
  const [artistName, setArtistName] = useState("");
  const [sources, setSources] = useState<string[]>(["", "", ""]);
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [structuredOutput, setStructuredOutput] = useState<OutputType | null>(null);

  const lastTodoWrite = [...events]
    .reverse()
    .find((e) => e.type === "tool_use" && e.name === "TodoWrite");
  const todos: TodoItem[] =
    lastTodoWrite?.type === "tool_use"
      ? ((lastTodoWrite.input as { todos?: TodoItem[] }).todos ?? [])
      : [];
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statusRef.current) {
      statusRef.current.scrollTop = statusRef.current.scrollHeight;
    }
  }, [events]);

  function removeSource(index: number) {
    setSources((prev) => prev.filter((_, i) => i !== index));
  }

  async function fetchGeneration() {
    setEvents([]);
    setStructuredOutput(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistName, sources: sources.filter(Boolean) }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            const event = JSON.parse(line.slice(6)) as SseEvent;
            console.log(event);
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
      <Flex direction="column" gap="6" height="100%">
        <Flex align="baseline">
          <Heading size="8" weight="bold">
            Artist Bio Assistant
          </Heading>
          <Spinner loading={isLoading} size="3" ml="2" />
        </Flex>

        <Separator size="4" />

        <Grid columns="3" gap="6" width="auto" style={{ flexGrow: 1, overflow: "hidden" }}>
          {/* Left column */}

          <Flex direction="column" gap="5">
            <Flex direction="column" gap="5">
              <Text size="5" weight="bold">
                Artist name
              </Text>

              <TextField.Root
                placeholder="Artist name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </Flex>

            <Flex direction="column" gap="3">
              <Text size="5" weight="bold">
                Sources
              </Text>
              {sources.map((src, i) => (
                <Flex key={i} gap="2" align="center">
                  <TextField.Root
                    placeholder={`Source ${i + 1}`}
                    value={src}
                    onChange={(e) =>
                      setSources((prev) => prev.map((s, j) => (j === i ? e.target.value : s)))
                    }
                    style={{ flexGrow: 1 }}
                  />
                  <Button variant="ghost" onClick={() => removeSource(i)}>
                    ✕
                  </Button>
                </Flex>
              ))}

              <Button variant="outline" onClick={() => setSources((prev) => [...prev, ""])}>
                + Add source
              </Button>
            </Flex>

            <Button
              size="4"
              onClick={fetchGeneration}
              disabled={isLoading || !artistName.trim() || !sources.some(Boolean)}
              mt="4"
              style={{ padding: "0.5rem 1.25rem", fontSize: "1rem", cursor: "pointer" }}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Processing…
                </>
              ) : (
                "Generate bio"
              )}
            </Button>
          </Flex>

          {/* Center column — structured output result */}

          <Flex direction="column" gap="4" height="100%" overflow="hidden">
            <Text size="5" weight="bold">
              Result
            </Text>

            <Box style={{ overflowY: "scroll", flexGrow: 1 }}>
              {structuredOutput === null ? (
                <ResultPlaceholder loading={isLoading} />
              ) : (
                <Result structuredOutput={structuredOutput} />
              )}
            </Box>
          </Flex>

          {/* Right column — agent event log */}

          <Flex direction="column" gap="4" height="100%" overflow="hidden">
            <Text size="5" weight="bold">
              Agent log
            </Text>

            <EventLog statusRef={statusRef} events={events} />
          </Flex>
        </Grid>
      </Flex>
      <TodoPanel todos={todos} />
    </Box>
  );
}
