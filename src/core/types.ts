export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
export type ThemeMode = 'modern' | 'windowsXP';
export type SoundPreset = 'soft' | 'retro' | 'arcade';

export interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  isExploded: boolean;
  adjacentMines: number;
}

export interface DifficultyConfig {
  width: number;
  height: number;
  mines: number;
}

export type Board = Cell[][];

export interface GameState {
  board: Board;
  status: GameStatus;
  paused: boolean;
  pausedAt: number | null;
  timer: number;
  remainingMines: number;
  difficulty: Difficulty;
  aiMode: boolean;
  theme: ThemeMode;
  soundEnabled: boolean;
  soundVolume: number;
  soundPreset: SoundPreset;
  cellSize: number;
  startedAt: number | null;
  explodedCell: { x: number; y: number } | null;
}

export interface AiMove {
  kind: 'open' | 'flag';
  x: number;
  y: number;
}
