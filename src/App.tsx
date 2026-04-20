import { Box, Button, Flex, Grid, Skeleton } from "@radix-ui/themes";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL as string;

interface HelloResponse {
  message: string;
}

export default function App() {
  const [response, setResponse] = useState<HelloResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ping() {
    setLoading(true);
    setResponse(null);
    setError(null);
    try {
      const res = await fetch(`${API}/hello`);
      const data: HelloResponse = await res.json();
      setTimeout(() => {
        setResponse(data);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
            {loading ? "Submitting…" : "Submit"}
          </Button>
        </Flex>

        {/* right column */}

        <Flex direction="column" gap="5" height="100%">
          {loading ? (
            <Skeleton>
              <Box height="100px" />
            </Skeleton>
          ) : (
            <>
              {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
              {error && <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>}
            </>
          )}
        </Flex>
      </Grid>
    </Box>
  );
}
