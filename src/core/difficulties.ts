import type { Difficulty, DifficultyConfig } from './types';

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { width: 9, height: 9, mines: 10 },
  normal: { width: 16, height: 16, mines: 40 },
  hard: { width: 24, height: 16, mines: 72 },
  veryHard: { width: 30, height: 16, mines: 99 }
};

export const getBoardConfig = (difficulty: Difficulty): DifficultyConfig => {
  const config = DIFFICULTIES[difficulty];
  return {
    width: Math.min(config.width, config.height),
    height: Math.max(config.width, config.height),
    mines: config.mines
  };
};
