import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { DIFFICULTIES } from '../core/difficulties';
import {
  checkWin,
  createEmptyBoard,
  openCell,
  openSafeNeighborsFromNumber,
  placeMinesSafe,
  revealAllMines,
  toggleFlag
} from '../core/game';
import { getProbabilityHints, getUncertainHint } from '../core/ai';
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
  | { type: 'SET_AI_SPEED'; speed: 1 | 2 | 4 }
  | { type: 'SET_SHOW_PROBABILITIES'; enabled: boolean }
  | { type: 'AI_STEP' }
  | { type: 'HINT' }
  | { type: 'SET_THEME'; theme: ThemeMode }
  | { type: 'SET_CELL_SIZE'; size: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SET_SOUND_ENABLED'; enabled: boolean }
  | { type: 'SET_SOUND_VOLUME'; volume: number }
  | { type: 'SET_SOUND_PRESET'; preset: SoundPreset };

const clampCellSize = (size: number): number => Math.max(18, Math.min(40, Math.round(size)));
const clampVolume = (volume: number): number => Math.max(0, Math.min(1, volume));
const clampAiSpeed = (speed: number): 1 | 2 | 4 => {
  if (speed >= 4) return 4;
  if (speed >= 2) return 2;
  return 1;
};
const calculateRemainingMines = (board: GameState['board'], difficulty: Difficulty): number => {
  const resolvedMines = board.flat().filter((cell) => cell.isMine && (cell.isOpen || cell.isFlagged)).length;
  return Math.max(0, DIFFICULTIES[difficulty].mines - resolvedMines);
};
const hasWon = (board: GameState['board'], difficulty: Difficulty): boolean =>
  checkWin(board) || calculateRemainingMines(board, difficulty) === 0;

const createInitialState = (
  difficulty: Difficulty = 'easy',
  options?: { aiMode?: boolean; aiSpeed?: 1 | 2 | 4; showProbabilities?: boolean }
): GameState => ({
  board: createEmptyBoard(difficulty),
  status: 'idle',
  paused: false,
  pausedAt: null,
  hintCell: null,
  hintConfidence: null,
  aiUncertain: false,
  aiAssisted: false,
  aiAssistCount: 0,
  autoSolveUsed: false,
  lives: 3,
  timer: 0,
  remainingMines: DIFFICULTIES[difficulty].mines,
  difficulty,
  aiMode: options?.aiMode ?? false,
  aiSpeed: options?.aiSpeed ?? 2,
  showProbabilities: options?.showProbabilities ?? false,
  probabilityAssistUsed: options?.showProbabilities ?? false,
  theme: 'modern',
  soundEnabled: true,
  soundVolume: 0.55,
  soundPreset: 'soft',
  cellSize: 28,
  startedAt: null,
  explodedCell: null
});

const findNewlyOpenedMine = (prevBoard: GameState['board'], nextBoard: GameState['board']) => {
  for (let y = 0; y < nextBoard.length; y += 1) {
    for (let x = 0; x < (nextBoard[0]?.length ?? 0); x += 1) {
      const prev = prevBoard[y]?.[x];
      const next = nextBoard[y]?.[x];
      if (!prev || !next) continue;
      if (next.isMine && next.isOpen && !prev.isOpen) return { x: next.x, y: next.y };
    }
  }
  return null;
};

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
    const exploded = findNewlyOpenedMine(state.board, board);
    if (exploded) {
      const lives = state.lives - 1;
      board[exploded.y][exploded.x].isExploded = true;
      const remainingMines = calculateRemainingMines(board, state.difficulty);
      if (lives <= 0) {
        board = revealAllMines(board);
        return {
          ...state,
          board,
          remainingMines: 0,
          hintCell: null,
          hintConfidence: null,
          aiUncertain: false,
          status: 'lost',
          lives: 0,
          startedAt,
          explodedCell: { x: exploded.x, y: exploded.y }
        };
      }
      return {
        ...state,
        board,
        remainingMines,
        hintCell: null,
        hintConfidence: null,
        aiUncertain: false,
        status,
        lives,
        startedAt,
        explodedCell: { x: exploded.x, y: exploded.y }
      };
    }
    const remainingMines = calculateRemainingMines(board, state.difficulty);
    const won = hasWon(board, state.difficulty);
    return {
      ...state,
      board,
      remainingMines,
      hintCell: null,
      hintConfidence: null,
      aiUncertain: false,
      status: won ? 'won' : status,
      startedAt,
      explodedCell
    };
  }

  board = openCell(board, x, y);
  const opened = board[y]?.[x];

  if (opened?.isMine) {
    opened.isExploded = true;
    const lives = state.lives - 1;
    const remainingMines = calculateRemainingMines(board, state.difficulty);
    if (lives <= 0) {
      board = revealAllMines(board);
      return {
        ...state,
        board,
        remainingMines: 0,
        hintCell: null,
        hintConfidence: null,
        aiUncertain: false,
        status: 'lost',
        lives: 0,
        startedAt,
        explodedCell: { x, y }
      };
    }
    return {
      ...state,
      board,
      remainingMines,
      hintCell: null,
      hintConfidence: null,
      aiUncertain: false,
      status,
      lives,
      startedAt,
      explodedCell: { x, y }
    };
  }

  const remainingMines = calculateRemainingMines(board, state.difficulty);
  const won = hasWon(board, state.difficulty);
  return {
    ...state,
    board,
    remainingMines,
    hintCell: null,
    hintConfidence: null,
    aiUncertain: false,
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
      const remainingMines = calculateRemainingMines(board, state.difficulty);
      const won = hasWon(board, state.difficulty);
      return {
        ...state,
        board,
        remainingMines,
        hintCell: null,
        hintConfidence: null,
        aiUncertain: false,
        status: won ? 'won' : state.status
      };
    }
    case 'RESET':
      return {
        ...createInitialState(action.difficulty ?? state.difficulty, {
          aiMode: state.aiMode,
          aiSpeed: state.aiSpeed,
          showProbabilities: state.showProbabilities
        }),
        theme: state.theme
      };
    case 'SET_DIFFICULTY':
      return createInitialState(action.difficulty, {
        aiMode: state.aiMode,
        aiSpeed: state.aiSpeed,
        showProbabilities: state.showProbabilities
      });
    case 'TICK':
      if (state.paused || state.status !== 'playing' || state.startedAt == null) return state;
      return { ...state, timer: Number(((Date.now() - state.startedAt) / 1000).toFixed(1)) };
    case 'TOGGLE_AI':
      return { ...state, aiMode: !state.aiMode };
    case 'SET_AI_SPEED':
      return { ...state, aiSpeed: clampAiSpeed(action.speed) };
    case 'SET_SHOW_PROBABILITIES':
      return {
        ...state,
        showProbabilities: action.enabled,
        probabilityAssistUsed: state.probabilityAssistUsed || action.enabled
      };
    case 'AI_STEP': {
      if (state.paused || state.status === 'won' || state.status === 'lost') return state;
      const probabilities = getProbabilityHints(state);
      if (probabilities.size === 0) return state;

      const hundred = [...probabilities.entries()].find(([, p]) => p === 100);
      if (hundred) {
        const [key] = hundred;
        const [x, y] = key.split(',').map(Number);
        const board = toggleFlag(state.board, x, y);
        const remainingMines = calculateRemainingMines(board, state.difficulty);
        const won = hasWon(board, state.difficulty);
        return {
          ...state,
          board,
          remainingMines,
          hintCell: null,
          hintConfidence: null,
          aiUncertain: false,
          aiAssisted: true,
          aiAssistCount: state.aiAssistCount + 1,
          autoSolveUsed: true,
          status: won ? 'won' : state.status
        };
      }

      const zero = [...probabilities.entries()].find(([, p]) => p === 0);
      if (!zero) return state;
      const [key] = zero;
      const [x, y] = key.split(',').map(Number);
      const opened = applyOpenCell(state, x, y);
      return { ...opened, aiAssisted: true, aiAssistCount: state.aiAssistCount + 1, autoSolveUsed: true };
    }
    case 'HINT': {
      if (state.paused || state.status === 'won' || state.status === 'lost') return state;
      const uncertain = getUncertainHint(state);
      if (!uncertain) return { ...state, hintCell: null, hintConfidence: null, aiUncertain: true };
      const nextHintCell = { x: uncertain.x, y: uncertain.y };
      const nextMineProbability = uncertain.mineProbability;
      const sameHint =
        state.hintCell?.x === nextHintCell.x &&
        state.hintCell?.y === nextHintCell.y &&
        state.hintConfidence === nextMineProbability;
      if (sameHint) {
        return state;
      }
      return {
        ...state,
        hintCell: nextHintCell,
        hintConfidence: nextMineProbability,
        aiUncertain: nextMineProbability > 0,
        aiAssisted: true,
        aiAssistCount: state.aiAssistCount + 1
      };
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
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 100);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state.aiMode) return;
    if (state.paused) return;
    if (state.status === 'won' || state.status === 'lost') return;
    const id = window.setInterval(() => dispatch({ type: 'AI_STEP' }), Math.max(30, Math.round(400 / state.aiSpeed)));
    return () => window.clearInterval(id);
  }, [state.aiMode, state.aiSpeed, state.paused, state.status]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
