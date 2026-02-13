import { DIFFICULTIES } from './difficulties';
import type { Board, Cell, Difficulty } from './types';

const directions = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
] as const;

export const createEmptyBoard = (difficulty: Difficulty): Board => {
  const { width, height } = DIFFICULTIES[difficulty];
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x): Cell => ({
      x,
      y,
      isMine: false,
      isOpen: false,
      isFlagged: false,
      isExploded: false,
      adjacentMines: 0
    }))
  );
};

const inBounds = (board: Board, x: number, y: number): boolean => {
  return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
};

export const getNeighbors = (board: Board, x: number, y: number): Cell[] => {
  const neighbors: Cell[] = [];
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (inBounds(board, nx, ny)) neighbors.push(board[ny][nx]);
  }
  return neighbors;
};

const cloneBoard = (board: Board): Board => board.map((row) => row.map((cell) => ({ ...cell })));

const floodOpenFrom = (board: Board, start: Cell): void => {
  const queue: Cell[] = [start];
  while (queue.length > 0) {
    const cell = queue.shift();
    if (!cell || cell.isOpen || cell.isFlagged) continue;
    cell.isOpen = true;

    if (cell.isMine) continue;
    if (cell.adjacentMines !== 0) continue;

    for (const n of getNeighbors(board, cell.x, cell.y)) {
      if (!n.isOpen && !n.isFlagged && !n.isMine) queue.push(n);
    }
  }
};

export const calculateAdjacentCounts = (board: Board): Board => {
  const next = cloneBoard(board);
  for (const row of next) {
    for (const cell of row) {
      if (cell.isMine) {
        cell.adjacentMines = -1;
        continue;
      }
      cell.adjacentMines = getNeighbors(next, cell.x, cell.y).filter((n) => n.isMine).length;
    }
  }
  return next;
};

export const placeMinesSafe = (board: Board, mineCount: number, safeX: number, safeY: number): Board => {
  const next = cloneBoard(board);
  const candidates: Array<{ x: number; y: number }> = [];
  for (const row of next) {
    for (const cell of row) {
      const nearFirstClick = Math.abs(cell.x - safeX) <= 1 && Math.abs(cell.y - safeY) <= 1;
      if (!nearFirstClick) candidates.push({ x: cell.x, y: cell.y });
    }
  }

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0; i < mineCount && i < candidates.length; i += 1) {
    const { x, y } = candidates[i];
    next[y][x].isMine = true;
  }

  return calculateAdjacentCounts(next);
};

export const revealAllMines = (board: Board): Board => {
  const next = cloneBoard(board);
  for (const row of next) {
    for (const cell of row) {
      if (cell.isMine) cell.isOpen = true;
    }
  }
  return next;
};

export const openCell = (board: Board, x: number, y: number): Board => {
  const next = cloneBoard(board);
  const start = next[y]?.[x];
  if (!start || start.isOpen || start.isFlagged) return next;
  floodOpenFrom(next, start);
  return next;
};

export const openSafeNeighborsFromNumber = (board: Board, x: number, y: number): Board => {
  const next = cloneBoard(board);
  const center = next[y]?.[x];
  if (!center || !center.isOpen || center.adjacentMines <= 0) return next;

  const neighbors = getNeighbors(next, x, y);
  const flaggedCount = neighbors.filter((n) => n.isFlagged).length;
  const unopened = neighbors.filter((n) => !n.isOpen && !n.isFlagged);
  const remainingMines = center.adjacentMines - flaggedCount;
  if (remainingMines < 0) return next;

  if (remainingMines === unopened.length) {
    for (const n of unopened) {
      n.isFlagged = true;
    }
    return next;
  }

  if (remainingMines !== 0) return next;

  for (const n of unopened) {
    n.isOpen = true;
  }
  return next;
};

export const toggleFlag = (board: Board, x: number, y: number): Board => {
  const next = cloneBoard(board);
  const cell = next[y]?.[x];
  if (!cell || cell.isOpen) return next;
  cell.isFlagged = !cell.isFlagged;
  return next;
};

export const checkWin = (board: Board): boolean => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isOpen) return false;
    }
  }
  return true;
};

export const countFlags = (board: Board): number =>
  board.flat().filter((cell) => cell.isFlagged).length;
