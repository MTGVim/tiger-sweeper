import { DIFFICULTIES } from './difficulties';
import { getNeighbors } from './game';
import type { AiMove, Board, GameState } from './types';

const keyOf = (x: number, y: number): string => `${x},${y}`;

const deterministicMove = (board: Board): AiMove | null => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isOpen || cell.adjacentMines <= 0) continue;

      const neighbors = getNeighbors(board, cell.x, cell.y);
      const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
      const flagged = neighbors.filter((n) => n.isFlagged);

      if (unopened.length === 0) continue;

      if (cell.adjacentMines === flagged.length) {
        const safe = unopened[0];
        return { kind: 'open', x: safe.x, y: safe.y };
      }

      if (cell.adjacentMines - flagged.length === unopened.length) {
        const mine = unopened[0];
        return { kind: 'flag', x: mine.x, y: mine.y };
      }
    }
  }

  return null;
};

const probabilisticMove = (state: GameState): AiMove | null => {
  const board = state.board;
  const unknown = board.flat().filter((c) => !c.isOpen && !c.isFlagged);
  if (unknown.length === 0) return null;

  const frontier = new Map<string, number>();
  let fallbackProbability = DIFFICULTIES[state.difficulty].mines / (board.length * board[0].length);

  for (const row of board) {
    for (const cell of row) {
      if (!cell.isOpen || cell.adjacentMines < 0) continue;

      const neighbors = getNeighbors(board, cell.x, cell.y);
      const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
      const flagged = neighbors.filter((n) => n.isFlagged).length;
      const remaining = cell.adjacentMines - flagged;

      if (unopened.length === 0 || remaining < 0) continue;
      const p = remaining / unopened.length;
      for (const n of unopened) {
        const k = keyOf(n.x, n.y);
        const current = frontier.get(k);
        frontier.set(k, current === undefined ? p : Math.max(current, p));
      }
    }
  }

  const inferredRemaining = state.remainingMines;
  if (unknown.length > 0) fallbackProbability = Math.max(0, inferredRemaining / unknown.length);

  let best = unknown[0];
  let bestP = frontier.get(keyOf(best.x, best.y)) ?? fallbackProbability;
  for (const cell of unknown) {
    const p = frontier.get(keyOf(cell.x, cell.y)) ?? fallbackProbability;
    if (p < bestP) {
      best = cell;
      bestP = p;
    }
  }

  return { kind: 'open', x: best.x, y: best.y };
};

export const getAiMove = (state: GameState): AiMove | null => {
  const deterministic = deterministicMove(state.board);
  if (deterministic) return deterministic;
  return probabilisticMove(state);
};
