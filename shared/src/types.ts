export type GameGenre = "action" | "puzzle" | "shooter" | "runner";
export type GameDifficulty = "easy" | "normal" | "hard";

export interface GenerateGameRequest {
  genre: GameGenre;
  difficulty: GameDifficulty;
  theme: string;
  goal: string;
}

export interface GameBundle {
  html: string;
  css: string;
  js: string;
}

export interface GenerateGameResponse {
  gameId: string;
  title: string;
  description: string;
  bundle: GameBundle;
}

export interface ExportZipRequest {
  title: string;
  description: string;
  bundle: GameBundle;
}
