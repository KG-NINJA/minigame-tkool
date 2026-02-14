import { useEffect, useMemo, useState } from "react";
import type { GameDifficulty, GameGenre, GenerateGameResponse } from "../../shared/src/types";

const GENRES: Array<{ label: string; value: GameGenre }> = [
  { label: "Action", value: "action" },
  { label: "Puzzle", value: "puzzle" },
  { label: "Shooter", value: "shooter" },
  { label: "Runner", value: "runner" }
];

const DIFFICULTIES: Array<{ label: string; value: GameDifficulty }> = [
  { label: "Easy", value: "easy" },
  { label: "Normal", value: "normal" },
  { label: "Hard", value: "hard" }
];

function buildPreviewDocument(result: GenerateGameResponse): string {
  const safeJs = result.bundle.js.split("</script>").join("<\\/script>");
  return [
    "<!doctype html>",
    "<html lang=\"en\">",
    "<head>",
    "<meta charset=\"UTF-8\" />",
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\" />",
    `<title>${result.title}</title>`,
    `<style>${result.bundle.css}</style>`,
    "</head>",
    "<body>",
    result.bundle.html,
    `<script>${safeJs}<\\/script>`,
    "</body>",
    "</html>"
  ].join("\n");
}

export default function App() {
  const [genre, setGenre] = useState<GameGenre>("action");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [theme, setTheme] = useState("Neon city rooftops");
  const [goal, setGoal] = useState("Collect 20 stars while avoiding hazards");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateGameResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  const previewDoc = useMemo(() => (result ? buildPreviewDocument(result) : ""), [result]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event?.data || typeof event.data !== "object") return;
      const data = event.data as { type?: string; url?: string };
      if (data.type !== "kgninja_tweet" || typeof data.url !== "string") return;
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function onGenerate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, difficulty, theme, goal })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate game.");
      }

      setResult(data as GenerateGameResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function onDownloadZip() {
    if (!result) return;

    setDownloading(true);
    setError(null);
    try {
      const response = await fetch("/api/export-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          bundle: result.bundle
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to export ZIP." }));
        throw new Error(data?.error || "Failed to export ZIP.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "mini-game"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown export error.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>minigame-tcool</h1>
        <p>Describe your idea. Generate a playable mini game. Download the source as a ZIP.</p>
      </header>

      <main className="grid">
        <section className="card form-card">
          <h2>Create Game</h2>
          <form onSubmit={onGenerate}>
            <label>
              Genre
              <select value={genre} onChange={(e) => setGenre(e.target.value as GameGenre)}>
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Theme
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                minLength={2}
                maxLength={40}
                placeholder="e.g. Ancient ruins"
              />
            </label>

            <label>
              Goal
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                minLength={4}
                maxLength={120}
                placeholder="e.g. Survive for 60 seconds"
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Mini Game"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
        </section>

        <section className="card preview-card">
          <div className="preview-header">
            <h2>Live Preview</h2>
            <button type="button" onClick={onDownloadZip} disabled={!result || downloading}>
              {downloading ? "Preparing ZIP..." : "Download ZIP"}
            </button>
          </div>

          {result ? (
            <>
              <p className="game-title">{result.title}</p>
              <p className="game-description">{result.description}</p>
              <iframe
                title="Generated mini game"
                className="preview-frame"
                sandbox="allow-scripts allow-popups allow-top-navigation-by-user-activation"
                srcDoc={previewDoc}
              />
            </>
          ) : (
            <p className="empty">Generated game preview will appear here.</p>
          )}
        </section>
      </main>
    </div>
  );
}
