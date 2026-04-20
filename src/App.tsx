import { Box, Button, Flex, Grid, Skeleton, Spinner, Text } from "@radix-ui/themes";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL as string;

export default function App() {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ping() {
    setLoading(true);
    setText(null);
    setError(null);
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
            const chunk = JSON.parse(line.slice(6));
            console.log("Receieved event: ", chunk);
            if (chunk.type === "text") {
              setText((prev) => (prev ?? "") + "\n\n" + chunk.text);
            }
            if (chunk.type === "tool") {
              const label =
                chunk.name === "WebFetch" && chunk.url ? `WebFetch: ${chunk.url}` : chunk.name;
              setText((prev) => (prev ?? "") + "\n\n" + label);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
          {loading && !text ? (
            <Skeleton>
              <Box height="100px" />
            </Skeleton>
          ) : (
            <>
              {text && <Text style={{ whiteSpace: "pre-wrap" }}>{text}</Text>}
              {error && <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>}
            </>
          )}
        </Flex>
      </Grid>
    </Box>
  );
}
