import { describe, expect, it } from 'vitest';
import { DIFFICULTIES } from '../difficulties';
import { calculateAdjacentCounts, createEmptyBoard, openCell, openSafeNeighborsFromNumber, placeMinesSafe } from '../game';

describe('game core', () => {
  it('keeps first click and adjacent cells mine-free', () => {
    const board = createEmptyBoard('easy');
    const mined = placeMinesSafe(board, DIFFICULTIES.easy.mines, 4, 4);

    for (let y = 3; y <= 5; y += 1) {
      for (let x = 3; x <= 5; x += 1) {
        expect(mined[y][x].isMine).toBe(false);
      }
    }
  });

  it('opens clicked cell', () => {
    const board = createEmptyBoard('easy');
    const opened = openCell(board, 0, 0);
    expect(opened[0][0].isOpen).toBe(true);
  });

  it('opens neighbors only when safety is guaranteed by flags', () => {
    const board = createEmptyBoard('easy');
    board[1][1].isMine = true;
    const counted = calculateAdjacentCounts(board);
    counted[2][2].isOpen = true;
    counted[1][1].isFlagged = true;

    const next = openSafeNeighborsFromNumber(counted, 2, 2);

    for (let y = 1; y <= 3; y += 1) {
      for (let x = 1; x <= 3; x += 1) {
        if (x === 2 && y === 2) continue;
        if (x === 1 && y === 1) {
          expect(next[y][x].isOpen).toBe(false);
          continue;
        }
        expect(next[y][x].isOpen).toBe(true);
      }
    }
  });

  it('does not open neighbors when safety is not guaranteed', () => {
    const board = createEmptyBoard('easy');
    board[1][1].isMine = true;
    const counted = calculateAdjacentCounts(board);
    counted[2][2].isOpen = true;

    const next = openSafeNeighborsFromNumber(counted, 2, 2);

    expect(next[2][1].isOpen).toBe(false);
    expect(next[1][2].isOpen).toBe(false);
    expect(next[3][2].isOpen).toBe(false);
    expect(next[2][3].isOpen).toBe(false);
  });

  it('flags neighbors when they are guaranteed mines', () => {
    const board = createEmptyBoard('easy');
    board[1][1].isMine = true;
    const counted = calculateAdjacentCounts(board);
    counted[2][2].isOpen = true;
    counted[1][2].isOpen = true;
    counted[2][1].isOpen = true;
    counted[3][2].isOpen = true;
    counted[2][3].isOpen = true;
    counted[1][3].isOpen = true;
    counted[3][1].isOpen = true;
    counted[3][3].isOpen = true;

    const next = openSafeNeighborsFromNumber(counted, 2, 2);

    expect(next[1][1].isFlagged).toBe(true);
  });

  it('opens only adjacent 8 cells on number click without flood spread', () => {
    const board = createEmptyBoard('easy');
    board[0][0].isMine = true;
    const counted = calculateAdjacentCounts(board);
    counted[1][1].isOpen = true;
    counted[0][0].isFlagged = true;

    const next = openSafeNeighborsFromNumber(counted, 1, 1);

    expect(next[2][2].isOpen).toBe(true);
    expect(next[3][3].isOpen).toBe(false);
  });
});
