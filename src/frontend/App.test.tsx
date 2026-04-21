import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "./App";

// VITE_API_URL is injected at build time; stub it for tests
vi.stubGlobal("import.meta", { env: { VITE_API_URL: "http://localhost:3001" } });

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the heading and ping button", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "ElectronShell" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ping /hello" })).toBeInTheDocument();
  });

  it("shows the API response after a successful ping", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      json: async () => ({ message: "Hello from Express!" }),
    } as Response);

    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Ping /hello" }));

    await waitFor(() =>
      expect(screen.getByText(/"message": "Hello from Express!"/)).toBeInTheDocument()
    );
  });

  it("shows an error message when the request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Ping /hello" }));

    await waitFor(() => expect(screen.getByText(/Error: Network error/)).toBeInTheDocument());
  });
});
