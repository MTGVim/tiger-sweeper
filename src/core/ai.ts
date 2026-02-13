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
      const flagged = neighbors.filter((n) => n.isFlagged || (n.isOpen && n.isMine));

      if (unopened.length === 0) continue;

      if (cell.adjacentMines === flagged.length) {
        // Trigger number-chording when the surrounding flags fully satisfy the number.
        return { kind: 'open', x: cell.x, y: cell.y };
      }

      if (cell.adjacentMines - flagged.length === unopened.length) {
        const mine = unopened[0];
        return { kind: 'flag', x: mine.x, y: mine.y };
      }
    }
  }

  return null;
};

export const getCertainAiMove = (board: Board): AiMove | null => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isOpen || cell.adjacentMines <= 0) continue;

      const neighbors = getNeighbors(board, cell.x, cell.y);
      const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
      const flagged = neighbors.filter((n) => n.isFlagged || (n.isOpen && n.isMine));

      if (unopened.length === 0) continue;
      if (cell.adjacentMines === flagged.length) {
        return { kind: 'open', x: cell.x, y: cell.y };
      }
    }
  }

  return null;
};

export const getCertainHintCell = (board: Board): { x: number; y: number } | null => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isOpen || cell.adjacentMines <= 0) continue;

      const neighbors = getNeighbors(board, cell.x, cell.y);
      const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
      const flagged = neighbors.filter((n) => n.isFlagged || (n.isOpen && n.isMine));
      if (unopened.length === 0) continue;
      if (cell.adjacentMines === flagged.length) {
        const safe = unopened[0];
        return { x: safe.x, y: safe.y };
      }
    }
  }
  return null;
};

const probabilisticMove = (state: GameState): AiMove | null => {
  const board = state.board;
  const unknown = board.flat().filter((c) => !c.isOpen && !c.isFlagged && !c.isMine);
  if (unknown.length === 0) return null;

  const frontier = new Map<string, number>();
  let fallbackProbability = DIFFICULTIES[state.difficulty].mines / (board.length * board[0].length);

  for (const row of board) {
    for (const cell of row) {
      if (!cell.isOpen || cell.adjacentMines < 0) continue;

      const neighbors = getNeighbors(board, cell.x, cell.y);
      const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
      const flagged = neighbors.filter((n) => n.isFlagged || (n.isOpen && n.isMine)).length;
      const remaining = cell.adjacentMines - flagged;

      if (unopened.length === 0 || remaining < 0) continue;
      const p = remaining / unopened.length;
      for (const n of unopened) {
        const k = keyOf(n.x, n.y);
        const current = frontier.get(k);
        frontier.set(k, current === undefined ? p : Math.min(current, p));
      }
    }
  }

  const inferredRemaining = state.remainingMines;
  if (unknown.length > 0) fallbackProbability = Math.max(0, inferredRemaining / unknown.length);

  const safeUnknown = unknown.filter((cell) => !cell.isMine);
  if (safeUnknown.length === 0) return null;

  let best = safeUnknown[0];
  let bestP = frontier.get(keyOf(best.x, best.y)) ?? fallbackProbability;
  for (const cell of safeUnknown) {
    const p = frontier.get(keyOf(cell.x, cell.y)) ?? fallbackProbability;
    if (p < bestP) {
      best = cell;
      bestP = p;
    }
  }

  return { kind: 'open', x: best.x, y: best.y };
};

export const getAiMove = (state: GameState): AiMove | null => {
  return deterministicMove(state.board);
};

const buildProbabilityMap = (state: GameState): {
  unknown: Array<{ x: number; y: number; p: number; inferred: boolean }>;
} => {
  const board = state.board;
  const unknownCells = board.flat().filter((c) => !c.isOpen && !c.isFlagged);
  const frontier = new Map<string, number>();
  const certainSafe = new Set<string>();
  const certainMine = new Set<string>();

  for (const row of board) {
    for (const cell of row) {
      if (!cell.isOpen || cell.adjacentMines < 0) continue;

      const neighbors = getNeighbors(board, cell.x, cell.y);
      const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
      const flagged = neighbors.filter((n) => n.isFlagged).length;
      const remaining = cell.adjacentMines - flagged;

      if (unopened.length === 0 || remaining < 0) continue;
      if (remaining === 0) {
        for (const n of unopened) certainSafe.add(keyOf(n.x, n.y));
      } else if (remaining === unopened.length) {
        for (const n of unopened) certainMine.add(keyOf(n.x, n.y));
      }

      const p = remaining / unopened.length;
      for (const n of unopened) {
        const k = keyOf(n.x, n.y);
        const current = frontier.get(k);
        // Conservative merge: any risk signal keeps mine probability from collapsing to 0.
        frontier.set(k, current === undefined ? p : Math.max(current, p));
      }
    }
  }

  const unknown = unknownCells.map((cell) => ({
    x: cell.x,
    y: cell.y,
    p: certainSafe.has(keyOf(cell.x, cell.y))
      ? 0
      : certainMine.has(keyOf(cell.x, cell.y))
        ? 1
        : frontier.get(keyOf(cell.x, cell.y)) ?? 1,
    inferred:
      certainSafe.has(keyOf(cell.x, cell.y)) ||
      certainMine.has(keyOf(cell.x, cell.y)) ||
      frontier.has(keyOf(cell.x, cell.y))
  }));

  return { unknown };
};

export const getUncertainHint = (state: GameState): { x: number; y: number; mineProbability: number } | null => {
  const { unknown } = buildProbabilityMap(state);
  if (unknown.length === 0) return null;

  const inferredCandidates = unknown.filter((c) => c.inferred);
  if (inferredCandidates.length === 0) return null;
  const pool = inferredCandidates;
  const best = [...pool].sort((a, b) => a.p - b.p)[0];
  const mineProbability = Math.max(0, Math.min(100, Math.round(best.p * 100)));
  return { x: best.x, y: best.y, mineProbability };
};

export const getProbabilityHints = (state: GameState): Map<string, number> => {
  const { unknown } = buildProbabilityMap(state);
  const map = new Map<string, number>();
  for (const cell of unknown) {
    if (!cell.inferred) continue;
    map.set(keyOf(cell.x, cell.y), Math.max(0, Math.min(100, Math.round(cell.p * 100))));
  }
  return map;
};
