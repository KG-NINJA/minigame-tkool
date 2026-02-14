import type { ExportZipRequest, GenerateGameRequest, GameDifficulty, GameGenre, GameBundle } from "../../shared/src/types";

const GENRES: GameGenre[] = ["action", "puzzle", "shooter", "runner"];
const DIFFICULTIES: GameDifficulty[] = ["easy", "normal", "hard"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateGenerateRequest(value: unknown): GenerateGameRequest {
  if (!isRecord(value)) {
    throw new Error("Request body must be an object.");
  }

  const genre = value.genre;
  const difficulty = value.difficulty;
  const theme = typeof value.theme === "string" ? value.theme.trim() : "";
  const goal = typeof value.goal === "string" ? value.goal.trim() : "";

  if (!GENRES.includes(genre as GameGenre)) {
    throw new Error("Invalid genre.");
  }
  if (!DIFFICULTIES.includes(difficulty as GameDifficulty)) {
    throw new Error("Invalid difficulty.");
  }
  if (theme.length < 2 || theme.length > 40) {
    throw new Error("Theme must be 2-40 characters.");
  }
  if (goal.length < 4 || goal.length > 120) {
    throw new Error("Goal must be 4-120 characters.");
  }

  return {
    genre: genre as GameGenre,
    difficulty: difficulty as GameDifficulty,
    theme,
    goal
  };
}

function validateBundle(bundle: unknown): GameBundle {
  if (!isRecord(bundle)) {
    throw new Error("bundle must be an object.");
  }

  const html = typeof bundle.html === "string" ? bundle.html : "";
  const css = typeof bundle.css === "string" ? bundle.css : "";
  const js = typeof bundle.js === "string" ? bundle.js : "";

  if (!html || !css || !js) {
    throw new Error("bundle html/css/js are required.");
  }

  if (html.length > 25000 || css.length > 20000 || js.length > 30000) {
    throw new Error("Generated code is too large.");
  }

  const suspicious = [
    /<script[^>]*src=/i,
    /https?:\/\//i,
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
    /import\s+[^;]+from/i
  ];

  const all = `${html}\n${css}\n${js}`;
  for (const pattern of suspicious) {
    if (pattern.test(all)) {
      throw new Error("Generated output includes blocked pattern.");
    }
  }

  return { html, css, js };
}

export function validateGeneratedPayload(value: unknown): { title: string; description: string; bundle: GameBundle } {
  if (!isRecord(value)) {
    throw new Error("LLM response must be an object.");
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";

  if (title.length < 3 || title.length > 80) {
    throw new Error("Invalid title in generated payload.");
  }
  if (description.length < 8 || description.length > 240) {
    throw new Error("Invalid description in generated payload.");
  }

  return {
    title,
    description,
    bundle: validateBundle(value.bundle)
  };
}

export function validateExportZipRequest(value: unknown): ExportZipRequest {
  if (!isRecord(value)) {
    throw new Error("Request body must be an object.");
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  if (title.length < 3 || title.length > 80) {
    throw new Error("title must be 3-80 characters.");
  }
  if (description.length < 8 || description.length > 240) {
    throw new Error("description must be 8-240 characters.");
  }

  return {
    title,
    description,
    bundle: validateBundle(value.bundle)
  };
}
