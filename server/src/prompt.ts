import type { GenerateGameRequest } from "../../shared/src/types";

export function buildGamePrompt(input: GenerateGameRequest): string {
  return [
    "You are a senior JavaScript game developer.",
    "Create a single-file browser mini game with keyboard controls.",
    "Do not use external libraries or external URLs.",
    "All logic must work offline.",
    "Use semantic HTML nodes only in body content (no html/head wrappers).",
    `Genre: ${input.genre}`,
    `Difficulty: ${input.difficulty}`,
    `Theme: ${input.theme}`,
    `Player goal: ${input.goal}`,
    "Keep code readable and deterministic.",
    "Return JSON that matches the required schema exactly."
  ].join("\n");
}
