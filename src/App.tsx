import { useState } from "react";

const API = "http://localhost:3001";

interface HelloResponse {
  message: string;
}

export default function App() {
  const [response, setResponse] = useState<HelloResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ping() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/hello`);
      const data: HelloResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 600 }}>
      <h1>Electr</h1>
      <p style={{ color: "#666" }}>React renderer talking to an embedded Express server.</p>

      <button
        onClick={ping}
        disabled={loading}
        style={{ padding: "0.5rem 1.25rem", fontSize: "1rem", cursor: "pointer" }}
      >
        {loading ? "Pinging…" : "Ping /hello"}
      </button>

      {response && (
        <pre style={{ marginTop: "1rem", background: "#f0f0f0", padding: "1rem", borderRadius: 4 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>}
    </div>
  );
}
