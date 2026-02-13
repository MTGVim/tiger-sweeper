import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { DIFFICULTIES } from '../core/difficulties';
import {
  checkWin,
  countFlags,
  createEmptyBoard,
  openCell,
  openSafeNeighborsFromNumber,
  placeMinesSafe,
  revealAllMines,
  toggleFlag
} from '../core/game';
import { getAiMove } from '../core/ai';
import type { Difficulty, GameState, SoundPreset, ThemeMode } from '../core/types';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

type Action =
  | { type: 'OPEN_CELL'; x: number; y: number }
  | { type: 'TOGGLE_FLAG'; x: number; y: number }
  | { type: 'RESET'; difficulty?: Difficulty }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'TICK' }
  | { type: 'TOGGLE_AI' }
  | { type: 'AI_STEP' }
  | { type: 'SET_THEME'; theme: ThemeMode }
  | { type: 'SET_CELL_SIZE'; size: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SET_SOUND_ENABLED'; enabled: boolean }
  | { type: 'SET_SOUND_VOLUME'; volume: number }
  | { type: 'SET_SOUND_PRESET'; preset: SoundPreset };

const clampCellSize = (size: number): number => Math.max(18, Math.min(40, Math.round(size)));
const clampVolume = (volume: number): number => Math.max(0, Math.min(1, volume));

const createInitialState = (difficulty: Difficulty = 'easy'): GameState => ({
  board: createEmptyBoard(difficulty),
  status: 'idle',
  paused: false,
  pausedAt: null,
  timer: 0,
  remainingMines: DIFFICULTIES[difficulty].mines,
  difficulty,
  aiMode: false,
  theme: 'modern',
  soundEnabled: true,
  soundVolume: 0.35,
  soundPreset: 'soft',
  cellSize: 28,
  startedAt: null,
  explodedCell: null
});

const applyOpenCell = (state: GameState, x: number, y: number): GameState => {
  const target = state.board[y]?.[x];
  if (!target || target.isFlagged || state.paused || state.status === 'won' || state.status === 'lost') {
    return state;
  }

  let board = state.board;
  let status = state.status;
  let startedAt = state.startedAt;
  const explodedCell = state.explodedCell;

  if (status === 'idle') {
    board = placeMinesSafe(board, DIFFICULTIES[state.difficulty].mines, x, y);
    status = 'playing';
    startedAt = Date.now();
  }

  if (target.isOpen) {
    board = openSafeNeighborsFromNumber(board, x, y);
    const exploded = board.flat().find((cell) => cell.isOpen && cell.isMine);
    if (exploded) {
      board = revealAllMines(board);
      board[exploded.y][exploded.x].isExploded = true;
      return {
        ...state,
        board,
        status: 'lost',
        startedAt,
        explodedCell: { x: exploded.x, y: exploded.y }
      };
    }
    const remainingMines = DIFFICULTIES[state.difficulty].mines - countFlags(board);
    const won = checkWin(board);
    return {
      ...state,
      board,
      remainingMines,
      status: won ? 'won' : status,
      startedAt,
      explodedCell
    };
  }

  board = openCell(board, x, y);
  const opened = board[y]?.[x];

  if (opened?.isMine) {
    opened.isExploded = true;
    board = revealAllMines(board);
    return {
      ...state,
      board,
      status: 'lost',
      startedAt,
      explodedCell: { x, y }
    };
  }

  const won = checkWin(board);
  return {
    ...state,
    board,
    status: won ? 'won' : status,
    startedAt,
    explodedCell
  };
};

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'OPEN_CELL':
      return applyOpenCell(state, action.x, action.y);
    case 'TOGGLE_FLAG': {
      if (state.paused || state.status === 'won' || state.status === 'lost') return state;
      const board = toggleFlag(state.board, action.x, action.y);
      const remainingMines = DIFFICULTIES[state.difficulty].mines - countFlags(board);
      return { ...state, board, remainingMines };
    }
    case 'RESET':
      return createInitialState(action.difficulty ?? state.difficulty);
    case 'SET_DIFFICULTY':
      return createInitialState(action.difficulty);
    case 'TICK':
      if (state.paused || state.status !== 'playing' || state.startedAt == null) return state;
      return { ...state, timer: Math.floor((Date.now() - state.startedAt) / 1000) };
    case 'TOGGLE_AI':
      return { ...state, aiMode: !state.aiMode };
    case 'AI_STEP': {
      if (state.paused || state.status === 'won' || state.status === 'lost') return state;
      const move = getAiMove(state);
      if (!move) return state;
      if (move.kind === 'flag') {
        const board = toggleFlag(state.board, move.x, move.y);
        const remainingMines = DIFFICULTIES[state.difficulty].mines - countFlags(board);
        return { ...state, board, remainingMines };
      }
      return applyOpenCell(state, move.x, move.y);
    }
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_CELL_SIZE':
      return { ...state, cellSize: clampCellSize(action.size) };
    case 'SET_SOUND_ENABLED':
      return { ...state, soundEnabled: action.enabled };
    case 'SET_SOUND_VOLUME':
      return { ...state, soundVolume: clampVolume(action.volume) };
    case 'SET_SOUND_PRESET':
      return { ...state, soundPreset: action.preset };
    case 'TOGGLE_PAUSE': {
      if (state.status !== 'playing' && !state.paused) return state;
      if (state.paused) {
        if (state.startedAt == null || state.pausedAt == null) {
          return { ...state, paused: false, pausedAt: null };
        }
        const pausedDuration = Date.now() - state.pausedAt;
        return {
          ...state,
          paused: false,
          pausedAt: null,
          startedAt: state.startedAt + pausedDuration
        };
      }
      return { ...state, paused: true, pausedAt: Date.now() };
    }
    default:
      return state;
  }
};

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, createInitialState());

  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state.aiMode) return;
    if (state.paused) return;
    if (state.status === 'won' || state.status === 'lost') return;
    const id = window.setInterval(() => dispatch({ type: 'AI_STEP' }), 300);
    return () => window.clearInterval(id);
  }, [state.aiMode, state.paused, state.status]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
