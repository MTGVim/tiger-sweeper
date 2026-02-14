import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Board } from './components/Board/Board';
import { DifficultySelector } from './components/DifficultySelector/DifficultySelector';
import { HUD } from './components/HUD/HUD';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import type { LeaderboardEntry } from './components/Leaderboard/Leaderboard';
import type { ThemeMode } from './core/types';
import { useGame } from './context/GameContext';
import { getProbabilityHints } from './core/ai';
import { usePwa } from './hooks/usePwa';
import { useSound } from './hooks/useSound';
import { messages } from './i18n/messages';

const LEADERBOARD_KEY = 'tiger-sweeper:leaderboard:v1';
const STREAKS_KEY = 'tiger-sweeper:streaks:v1';
const THEME_KEY = 'tiger-sweeper:theme:v1';
const GITHUB_URL_PLACEHOLDER = 'https://github.com/MTGVim/tiger-sweeper';
const difficultyRank: Record<LeaderboardEntry['difficulty'], number> = {
  easy: 0,
  normal: 1,
  hard: 2
};
const normalizeDifficulty = (difficulty: unknown): LeaderboardEntry['difficulty'] => {
  if (difficulty === 'easy' || difficulty === 'normal' || difficulty === 'hard') return difficulty;
  return 'hard';
};

const sortLeaderboard = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort((a, b) => {
    const penalty = (entry: LeaderboardEntry) => (entry.probabilityAssistUsed ? 2 : entry.autoSolveUsed ? 1 : 0);
    if (a.difficulty !== b.difficulty) return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
    if (penalty(a) !== penalty(b)) return penalty(a) - penalty(b);
    if (a.lives !== b.lives) return b.lives - a.lives;
    if (a.time !== b.time) return a.time - b.time;
    return a.createdAt - b.createdAt;
  });

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(parsed)) return [];
    return sortLeaderboard(
      parsed.map((entry) => ({
        ...entry,
        difficulty: normalizeDifficulty(entry.difficulty),
        assists: typeof entry.assists === 'number' ? entry.assists : 0,
        lives: typeof entry.lives === 'number' ? entry.lives : 0,
        autoSolveUsed: Boolean(entry.autoSolveUsed),
        probabilityAssistUsed: Boolean(entry.probabilityAssistUsed),
        time: typeof entry.time === 'number' ? entry.time : 0
      }))
    );
  } catch {
    return [];
  }
};

type DifficultyKey = LeaderboardEntry['difficulty'];
type StreakKind = 'win' | 'lose' | null;
type StreaksByDifficulty = Record<DifficultyKey, { kind: StreakKind; count: number }>;

const createEmptyStreaks = (): StreaksByDifficulty => ({
  easy: { kind: null, count: 0 },
  normal: { kind: null, count: 0 },
  hard: { kind: null, count: 0 }
});

const loadStreaks = (): StreaksByDifficulty => {
  const empty = createEmptyStreaks();
  try {
    const raw = localStorage.getItem(STREAKS_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StreaksByDifficulty>;
    const normalize = (d: DifficultyKey) => {
      const item = parsed[d];
      const kind: StreakKind = item?.kind === 'win' || item?.kind === 'lose' ? item.kind : null;
      const count = typeof item?.count === 'number' && item.count > 0 ? Math.floor(item.count) : 0;
      return { kind: count > 0 ? kind : null, count: count > 0 ? count : 0 };
    };
    return {
      easy: normalize('easy'),
      normal: normalize('normal'),
      hard: normalize('hard')
    };
  } catch {
    return empty;
  }
};

const applyStreak = (prev: StreaksByDifficulty, difficulty: DifficultyKey, result: 'win' | 'lose'): StreaksByDifficulty => {
  const current = prev[difficulty];
  const nextCount = current.kind === result ? current.count + 1 : 1;
  return {
    ...prev,
    [difficulty]: { kind: result, count: nextCount }
  };
};

const breakWinStreakOnNewGame = (prev: StreaksByDifficulty, difficulty: DifficultyKey): StreaksByDifficulty => {
  const current = prev[difficulty];
  if (current.kind !== 'win' || current.count <= 0) return prev;
  return {
    ...prev,
    [difficulty]: { kind: null, count: 0 }
  };
};

export const App = () => {
  const { state, dispatch } = useGame();
  const play = useSound(state.soundPreset, state.soundEnabled);
  const prevStatusRef = useRef(state.status);
  const prevLivesRef = useRef(state.lives);
  const prevFlagCountRef = useRef(state.board.flat().filter((cell) => cell.isFlagged).length);
  const boardHostRef = useRef<HTMLDivElement | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [streaks, setStreaks] = useState<StreaksByDifficulty>(() => loadStreaks());
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pressedCells, setPressedCells] = useState<Set<string>>(new Set());
  const [boardHostWidth, setBoardHostWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [boardShakeSignal, setBoardShakeSignal] = useState(0);
  const [themeHydrated, setThemeHydrated] = useState(false);

  usePwa();

  useEffect(() => {
    if (prevStatusRef.current !== state.status) {
      if (state.status === 'won') {
        play('win');
        setStreaks((prev) => {
          const next = applyStreak(prev, state.difficulty, 'win');
          localStorage.setItem(STREAKS_KEY, JSON.stringify(next));
          return next;
        });
        confetti({
          particleCount: 120,
          spread: 90,
          startVelocity: 45,
          origin: { y: 0.6 }
        });
        window.setTimeout(
          () =>
            confetti({
              particleCount: 70,
              spread: 120,
              startVelocity: 35,
              origin: { x: 0.2, y: 0.65 }
            }),
          180
        );
        window.setTimeout(
          () =>
            confetti({
              particleCount: 70,
              spread: 120,
              startVelocity: 35,
              origin: { x: 0.8, y: 0.65 }
            }),
          300
        );
        setLeaderboard((prev) => {
          const sorted = sortLeaderboard([
            ...prev,
            {
              id: crypto.randomUUID(),
              difficulty: state.difficulty,
              time: state.timer,
              assists: state.aiAssistCount,
              lives: state.lives,
              autoSolveUsed: state.autoSolveUsed,
              probabilityAssistUsed: state.probabilityAssistUsed,
              createdAt: Date.now()
            }
          ]);
          const next = sorted.slice(0, 90);
          localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
          return next;
        });
      }
      if (state.status === 'lost') {
        setStreaks((prev) => {
          const next = applyStreak(prev, state.difficulty, 'lose');
          localStorage.setItem(STREAKS_KEY, JSON.stringify(next));
          return next;
        });
        window.setTimeout(() => play('lose'), 140);
      }
      prevStatusRef.current = state.status;
    }
  }, [
    play,
    state.aiAssistCount,
    state.autoSolveUsed,
    state.difficulty,
    state.lives,
    state.probabilityAssistUsed,
    state.status,
    state.timer
  ]);

  useEffect(() => {
    if (state.status !== 'won' && state.lives < prevLivesRef.current) {
      play('explode');
      setBoardShakeSignal((v) => v + 1);
    }
    prevLivesRef.current = state.lives;
  }, [play, state.lives, state.status]);

  useEffect(() => {
    const flagCount = state.board.flat().filter((cell) => cell.isFlagged).length;
    const flagPlaced = flagCount > prevFlagCountRef.current;
    if (flagPlaced && !optionsOpen) {
      play('flag');
    }
    prevFlagCountRef.current = flagCount;
  }, [optionsOpen, play, state.board]);

  useEffect(() => {
    document.body.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const nextTheme: ThemeMode | null = saved === 'windowsXP' || saved === 'modern' ? saved : null;
    if (nextTheme && nextTheme !== state.theme) {
      dispatch({ type: 'SET_THEME', theme: nextTheme });
    }
    setThemeHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (!themeHydrated) return;
    localStorage.setItem(THEME_KEY, state.theme);
  }, [state.theme, themeHydrated]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cell-size', `${state.cellSize}px`);
    root.style.setProperty('--cell-font-size', `${Math.max(11, Math.floor(state.cellSize * 0.5))}px`);
  }, [state.cellSize]);

  useEffect(() => {
    const el = boardHostRef.current;
    if (!el) return;

    const update = () => setBoardHostWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const updateViewportMode = () => {
      const canMatch = typeof window.matchMedia === 'function';
      const coarsePointer = canMatch ? window.matchMedia('(pointer: coarse)').matches : false;
      const mobileLike = coarsePointer || window.innerWidth <= 900;
      setIsMobile(mobileLike);
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    window.addEventListener('orientationchange', updateViewportMode);
    return () => {
      window.removeEventListener('resize', updateViewportMode);
      window.removeEventListener('orientationchange', updateViewportMode);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isUndoKey = event.key.toLowerCase() === 'z';
      if (!isUndoKey) return;
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (state.undoStack.length === 0) return;
      event.preventDefault();
      dispatch({ type: 'UNDO' });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, state.undoStack.length]);

  const handleNewGame = () => {
    dispatch({ type: 'RESET' });
    if (state.status === 'won') return;
    setStreaks((prev) => {
      const next = breakWinStreakOnNewGame(prev, state.difficulty);
      if (next === prev) return prev;
      localStorage.setItem(STREAKS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const openOptions = () => setOptionsOpen(true);
  const closeOptions = () => setOptionsOpen(false);

  const startNumberPressWave = (x: number, y: number) => {
    if (optionsOpen) return;
    const target = state.board[y]?.[x];
    if (!target || !target.isOpen || target.adjacentMines <= 0) return;

    const height = state.board.length;
    const width = state.board[0]?.length ?? 0;
    const next = new Set<string>();
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
        const neighbor = state.board[ny]?.[nx];
        if (!neighbor || neighbor.isOpen || neighbor.isFlagged) continue;
        next.add(`${nx},${ny}`);
      }
    }

    setPressedCells(next);
  };

  const endNumberPressWave = () => {
    setPressedCells(new Set());
  };

  const boardColumns = state.board[0]?.length ?? 0;
  const boardPixelWidth = boardColumns * state.cellSize + Math.max(0, boardColumns - 1) * 1 + 10;
  const boardScale = boardHostWidth > 0 ? Math.min(1, boardHostWidth / boardPixelWidth) : 1;
  const canUndo = state.undoStack.length > 0;
  const autoSolveDisabled = false;
  const t = messages;
  const statusLabel = t.hud.status[state.status];
  const timerText = `${state.timer.toFixed(1)}s`;
  const probabilityHints = state.showProbabilities ? getProbabilityHints(state) : new Map<string, number>();
  const probabilityPrefix = state.probabilityAssistUsed ? '👀 ' : '';
  const currentStreak = streaks[state.difficulty];
  const difficultyLabelForStreak = t.difficulty[state.difficulty];
  const streakLabel =
    currentStreak.kind == null || currentStreak.count === 0
      ? `${difficultyLabelForStreak} 스트릭 없음`
      : currentStreak.kind === 'win'
        ? `${difficultyLabelForStreak} 연승 ${currentStreak.count}`
        : `${difficultyLabelForStreak} 연패 ${currentStreak.count}`;

  return (
    <div className="grid min-h-screen place-items-center p-2 sm:p-4">
      <div className="w-full min-w-0 max-w-[980px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-[0_14px_40px_rgb(0_0_0_/_16%)] sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">{t.appTitle}</h1>
          <a
            href={GITHUB_URL_PLACEHOLDER}
            target="_blank"
            rel="noreferrer"
            aria-label={t.githubAria}
            className="ui-button inline-flex h-9 w-9 items-center justify-center rounded-md"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.4 0-.2-.01-.84-.01-1.52-2.01.45-2.53-.51-2.69-.98-.09-.25-.48-1.02-.82-1.22-.28-.16-.68-.57-.01-.58.63-.01 1.08.59 1.23.84.72 1.25 1.87.9 2.33.68.07-.54.28-.9.5-1.11-1.78-.21-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85A7.3 7.3 0 0 1 8 4.54c.68 0 1.36.1 2 .29 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.31.82 2.22 0 3.18-1.87 3.88-3.65 4.09.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.49.55.4A8.36 8.36 0 0 0 16 8.33C16 3.73 12.42 0 8 0Z" />
            </svg>
          </a>
        </div>

        <div className="mt-4 mx-auto w-full max-w-[486px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2">
          <DifficultySelector
            difficulty={state.difficulty}
            label={t.difficultyLabel}
            labels={t.difficulty}
            onChange={(difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty })}
          />

          <div className="mt-2">
            <HUD
              status={state.status}
              canUndo={canUndo}
              lives={state.lives}
              timer={state.timer}
              remainingMines={state.remainingMines}
              aiMode={state.aiMode}
              aiSpeed={state.aiSpeed}
              autoSolveDisabled={autoSolveDisabled}
              showProbabilities={state.showProbabilities}
              hideStatus
              hidePrimaryControls
              labels={t.hud}
              onReset={handleNewGame}
              onToggleAI={() => dispatch({ type: 'TOGGLE_AI' })}
              onAiSpeedChange={(speed) => dispatch({ type: 'SET_AI_SPEED', speed })}
              onToggleProbabilities={() =>
                dispatch({ type: 'SET_SHOW_PROBABILITIES', enabled: !state.showProbabilities })
              }
              onUndo={() => dispatch({ type: 'UNDO' })}
              onOpenOptions={openOptions}
            />
          </div>
        </div>

        <div className="sticky top-2 z-20 mt-3 mx-auto w-full max-w-[486px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2">
          <div className="flex min-w-0 flex-wrap items-stretch gap-2">
            <div className="flex min-w-[180px] flex-1 flex-col justify-between gap-2">
              <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-white/60 p-2 text-xs font-bold sm:p-3 sm:text-base">
                <span>⏱ {timerText}</span>
                <span>❤️ {state.lives}</span>
                <span>🚩 {state.remainingMines}</span>
                <span>{statusLabel}</span>
              </div>
              <div className="flex h-[26px] items-center rounded-md border border-[var(--border)] bg-white/75 px-2 py-1 text-[11px] font-bold leading-none">
                {currentStreak.kind === 'win' ? '🔥' : currentStreak.kind === 'lose' ? '💥' : '➖'} {streakLabel}
              </div>
            </div>
            <div className="flex h-[68px] min-w-[180px] flex-1 content-center items-center self-stretch justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/60 px-1.5 py-2 max-[420px]:h-[48px] max-[420px]:py-1">
              <button className="ui-button inline-flex h-[34px] min-w-[56px] flex-none items-center justify-center rounded-md px-2 text-[10px] leading-none sm:min-w-[64px]" onClick={handleNewGame}>
                {t.hud.newGame}
              </button>
              <button
                className="ui-button inline-flex h-[34px] min-w-[56px] flex-none items-center justify-center rounded-md px-2 text-[10px] leading-none sm:min-w-[64px]"
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={!canUndo}
              >
                {t.hud.undo}
              </button>
              <button className="ui-button inline-flex h-[34px] min-w-[56px] flex-none items-center justify-center rounded-md px-2 text-[10px] leading-none sm:min-w-[64px]" onClick={openOptions}>
                {t.hud.options}
              </button>
            </div>
          </div>
        </div>

        <div ref={boardHostRef} className="mt-5 w-full min-w-0">
          <Board
            board={state.board}
            cellSize={state.cellSize}
            boardScale={boardScale}
            disabled={optionsOpen}
            obscured={optionsOpen}
            interactionMode="open"
            enableLongPressHaptics={isMobile && !state.aiMode}
            obscuredLabel={t.board.obscured}
            hintCell={state.hintCell}
            pressedCells={pressedCells}
            probabilityHints={probabilityHints}
            shakeSignal={boardShakeSignal}
            noticeMessage={
              state.status === 'won'
                ? state.autoSolveUsed
                  ? `You Win! ${probabilityPrefix}🤖`
                  : `You Win! ${probabilityPrefix}😎`
                : state.status === 'lost'
                  ? `${probabilityPrefix}🤦`
                : state.hintConfidence != null
                  ? t.board.confidence(state.hintConfidence)
                  : null
            }
            onPressStart={startNumberPressWave}
            onPressEnd={endNumberPressWave}
            onOpen={(x, y) => {
              dispatch({ type: 'OPEN_CELL', x, y });
              if (!optionsOpen) play('click');
            }}
            onFlag={(x, y) => {
              const target = state.board[y]?.[x];
              if (!target || target.isOpen || optionsOpen || state.status === 'won' || state.status === 'lost') {
                return false;
              }
              dispatch({ type: 'TOGGLE_FLAG', x, y });
              return true;
            }}
          />
        </div>

        <div className="mx-auto mt-2 w-full max-w-[486px]">
          <Leaderboard
            entries={leaderboard}
            difficultyLabels={t.difficulty}
            labels={t.leaderboard}
            onClear={() => {
              const ok = window.confirm('리더보드를 정말 초기화할까요?');
              if (!ok) return;
              setLeaderboard([]);
              localStorage.removeItem(LEADERBOARD_KEY);
            }}
          />
        </div>

      </div>

      {optionsOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-3">
          <div className="w-full max-w-[560px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[0_14px_40px_rgb(0_0_0_/_16%)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">{t.options.title}</h3>
              <button className="ui-button rounded-md px-3 py-2 text-sm" onClick={closeOptions}>{t.options.close}</button>
            </div>

            <div className="grid gap-2 sm:grid-cols-1">
              <button
                className="ui-button rounded-md px-3 py-2 text-sm"
                onClick={() =>
                  dispatch({ type: 'SET_THEME', theme: state.theme === 'modern' ? 'windowsXP' : 'modern' })
                }
              >
                {state.theme === 'modern' ? t.options.themeToXp : t.options.themeToModern}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <label htmlFor="sound-enabled" className="text-sm font-semibold">{t.options.sound}</label>
              <input
                id="sound-enabled"
                type="checkbox"
                checked={state.soundEnabled}
                onChange={(e) => dispatch({ type: 'SET_SOUND_ENABLED', enabled: e.target.checked })}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <label htmlFor="sound-preset" className="text-sm font-semibold">{t.options.preset}</label>
              <select
                id="sound-preset"
                className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
                value={state.soundPreset}
                onChange={(e) => dispatch({ type: 'SET_SOUND_PRESET', preset: e.target.value as typeof state.soundPreset })}
              >
                <option value="soft">{t.options.presetSoft}</option>
                <option value="retro">{t.options.presetRetro}</option>
                <option value="arcade">{t.options.presetArcade}</option>
              </select>
            </div>

          </div>
        </div>
      ) : null}

    </div>
  );
};
