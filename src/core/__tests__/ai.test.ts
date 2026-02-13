import { describe, expect, it } from 'vitest';
import { getProbabilityHints } from '../ai';
import type { Board, GameState } from '../types';

const createState = (board: Board): GameState => ({
  board,
  status: 'playing',
  paused: false,
  pausedAt: null,
  hintCell: null,
  hintConfidence: null,
  aiUncertain: false,
  aiAssisted: false,
  aiAssistCount: 0,
  autoSolveUsed: false,
  lives: 2,
  timer: 10,
  remainingMines: 1,
  difficulty: 'easy',
  aiMode: true,
  aiSpeed: 1,
  showProbabilities: true,
  probabilityAssistUsed: true,
  theme: 'modern',
  soundEnabled: false,
  soundVolume: 0,
  soundPreset: 'soft',
  cellSize: 26,
  startedAt: Date.now() - 1000,
  explodedCell: { x: 0, y: 0 }
});

describe('getProbabilityHints', () => {
  it('treats already-opened mines as resolved around numbers', () => {
    const board: Board = [
      [
        { x: 0, y: 0, isMine: true, isOpen: true, isFlagged: false, isExploded: true, adjacentMines: -1 },
        { x: 1, y: 0, isMine: false, isOpen: true, isFlagged: false, isExploded: false, adjacentMines: 1 },
        { x: 2, y: 0, isMine: false, isOpen: false, isFlagged: false, isExploded: false, adjacentMines: 0 }
      ]
    ];

    const hints = getProbabilityHints(createState(board));
    expect(hints.get('2,0')).toBe(0);
  });
});
