import type { GenerateGameRequest } from "../../shared/src/types";
import { buildGamePrompt } from "./prompt";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

interface OpenAIJsonResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function isMockModeEnabled(): boolean {
  const value = (process.env.MOCK_MODE ?? "").toLowerCase().trim();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function buildMockPayload(input: GenerateGameRequest): unknown {
  const title = `${input.theme} ${input.genre} mini game`;
  const description = `Mock mode game (${input.difficulty}). Goal: ${input.goal}`;
  return {
    title,
    description,
    bundle: {
      html: `
<main id="app">
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Press Space to score points.</p>
  <p id="score">Score: 0</p>
  <button id="start">Start</button>
</main>`.trim(),
      css: `
body { margin: 0; font-family: Arial, sans-serif; background: #111; color: #f5f5f5; }
#app { max-width: 560px; margin: 24px auto; padding: 16px; border: 1px solid #444; border-radius: 12px; }
#start { padding: 10px 14px; border: 0; border-radius: 8px; font-weight: 700; cursor: pointer; }
`.trim(),
      js: `
(() => {
  let score = 0;
  let started = false;
  const scoreEl = document.getElementById("score");
  const startBtn = document.getElementById("start");
  function render() {
    if (scoreEl) scoreEl.textContent = "Score: " + score;
  }
  function onKeyDown(event) {
    if (!started) return;
    if (event.code === "Space") {
      score += 1;
      render();
    }
  }
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      started = true;
      score = 0;
      render();
      startBtn.textContent = "Playing... (hit Space)";
      startBtn.setAttribute("disabled", "true");
    });
  }
  window.addEventListener("keydown", onKeyDown);
  render();
})();
`.trim()
    }
  };
}

const GAME_SCHEMA = {
  name: "mini_game_bundle",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      bundle: {
        type: "object",
        additionalProperties: false,
        properties: {
          html: { type: "string" },
          css: { type: "string" },
          js: { type: "string" }
        },
        required: ["html", "css", "js"]
      }
    },
    required: ["title", "description", "bundle"]
  }
};

export async function generateGameWithOpenAI(input: GenerateGameRequest): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (isMockModeEnabled() || !apiKey) {
    return buildMockPayload(input);
  }

  const model = getEnv("OPENAI_MODEL", "gpt-4.1-mini");

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: GAME_SCHEMA
      },
      messages: [
        {
          role: "system",
          content:
            "You generate secure browser mini games. Output only valid JSON following schema. Avoid network access and external dependencies."
        },
        {
          role: "user",
          content: buildGamePrompt(input)
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${body}`);
  }

  const json = (await response.json()) as OpenAIJsonResponse;
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response did not include content.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned non-JSON content.");
  }
}
