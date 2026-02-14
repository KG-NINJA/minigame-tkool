# minigame-tcool

A web app that lets anyone generate and play a mini browser game from a short prompt, then download the generated source as a ZIP.

Japanese README: `README.ja.md`

## Features

- Prompt-based mini game generation via OpenAI API
- Instant in-browser preview using a sandboxed iframe
- ZIP export with `index.html`, `style.css`, `game.js`, and `README.txt`
- Input and output validation with blocked-pattern checks
- Every generated game includes a required X share button with `#KGNINJA`

## Tech Stack

- React + TypeScript + Vite (`client/`)
- Node.js + Express + TypeScript (`server/`)
- Shared request/response types (`shared/`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Set `OPENAI_API_KEY` in `.env` when using real model generation.\n\nFor local testing without an API key, set `MOCK_MODE=1`.\n\nIf you want the tweet to include your repository URL, set `GITHUB_REPO_URL` (for example `https://github.com/<you>/minigame-tcool`).

3. Run in development mode:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`



## Mock Mode (No API Key)

Use mock mode to test generation flow without OpenAI credentials:

```bash
MOCK_MODE=1 npm run dev
```

In mock mode, `POST /api/generate` returns a deterministic sample game and still enforces the required `#KGNINJA` share button injection.

## Build and Run

```bash
npm run build
npm run start
```

## API

### `POST /api/generate`

Request body:

```json
{
  "genre": "action",
  "difficulty": "easy",
  "theme": "Neon city rooftops",
  "goal": "Collect 20 stars while avoiding hazards"
}
```

Response body:

```json
{
  "gameId": "uuid",
  "title": "string",
  "description": "string",
  "bundle": {
    "html": "string",
    "css": "string",
    "js": "string"
  }
}
```

### `POST /api/export-zip`

Request body:

```json
{
  "title": "game title",
  "description": "game summary",
  "bundle": {
    "html": "...",
    "css": "...",
    "js": "..."
  }
}
```

Returns `application/zip`.

## Notes

- Generated code is restricted to offline-safe patterns (no external script URLs/network calls).
- If model output is invalid, the server retries generation once before returning an error.
- The server enforces a required share link (`Post on X #KGNINJA`) in generated game content.\n- If `GITHUB_REPO_URL` is set, it is appended to the X post text.
