import { useEffect, useRef, useState } from 'react';
import { Board } from './components/Board/Board';
import { DifficultySelector } from './components/DifficultySelector/DifficultySelector';
import { HUD } from './components/HUD/HUD';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import type { LeaderboardEntry } from './components/Leaderboard/Leaderboard';
import { Modal } from './components/Modal/Modal';
import { useGame } from './context/GameContext';
import { usePwa } from './hooks/usePwa';
import { useSound } from './hooks/useSound';

const LEADERBOARD_KEY = 'tiger-sweeper:leaderboard:v1';

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export const App = () => {
  const { state, dispatch } = useGame();
  const play = useSound(state.soundPreset, state.soundVolume, state.soundEnabled);
  const prevStatusRef = useRef(state.status);
  const optionsPausedRef = useRef(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [optionsOpen, setOptionsOpen] = useState(false);

  usePwa();

  useEffect(() => {
    if (prevStatusRef.current !== state.status) {
      if (state.status === 'won') {
        play('win');
        setLeaderboard((prev) => {
          const next = [
            ...prev,
            {
              id: crypto.randomUUID(),
              difficulty: state.difficulty,
              time: state.timer,
              createdAt: Date.now()
            }
          ]
            .sort((a, b) => a.time - b.time || a.createdAt - b.createdAt)
            .slice(0, 30);
          localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
          return next;
        });
      }
      if (state.status === 'lost') play('lose');
      prevStatusRef.current = state.status;
    }
  }, [play, state.difficulty, state.status, state.timer]);

  useEffect(() => {
    document.body.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cell-size', `${state.cellSize}px`);
    root.style.setProperty('--cell-font-size', `${Math.max(11, Math.floor(state.cellSize * 0.5))}px`);
  }, [state.cellSize]);

  useEffect(() => {
    if ((state.status === 'won' || state.status === 'lost') && optionsOpen) {
      setOptionsOpen(false);
      if (optionsPausedRef.current && state.paused) {
        dispatch({ type: 'TOGGLE_PAUSE' });
      }
      optionsPausedRef.current = false;
    }
  }, [dispatch, optionsOpen, state.paused, state.status]);

  const openOptions = () => {
    if (!optionsOpen) {
      if (state.status === 'playing' && !state.paused) {
        dispatch({ type: 'TOGGLE_PAUSE' });
        optionsPausedRef.current = true;
      } else {
        optionsPausedRef.current = false;
      }
      setOptionsOpen(true);
    }
  };

  const closeOptions = () => {
    setOptionsOpen(false);
    if (optionsPausedRef.current && state.paused) {
      dispatch({ type: 'TOGGLE_PAUSE' });
    }
    optionsPausedRef.current = false;
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-[980px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[0_14px_40px_rgb(0_0_0_/_16%)] sm:p-4">
        <DifficultySelector
          difficulty={state.difficulty}
          onChange={(difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty })}
        />

        <HUD
          status={state.status}
          paused={state.paused}
          timer={state.timer}
          remainingMines={state.remainingMines}
          aiMode={state.aiMode}
          theme={state.theme}
          cellSize={state.cellSize}
          soundEnabled={state.soundEnabled}
          soundVolume={state.soundVolume}
          soundPreset={state.soundPreset}
          onReset={() => dispatch({ type: 'RESET' })}
          onToggleAI={() => dispatch({ type: 'TOGGLE_AI' })}
          onAiStep={() => dispatch({ type: 'AI_STEP' })}
          onToggleTheme={() =>
            dispatch({ type: 'SET_THEME', theme: state.theme === 'modern' ? 'windowsXP' : 'modern' })
          }
          onCellSizeChange={(size) => dispatch({ type: 'SET_CELL_SIZE', size })}
          onTogglePause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          onSoundEnabledChange={(enabled) => dispatch({ type: 'SET_SOUND_ENABLED', enabled })}
          onSoundVolumeChange={(volume) => dispatch({ type: 'SET_SOUND_VOLUME', volume })}
          onSoundPresetChange={(preset) => dispatch({ type: 'SET_SOUND_PRESET', preset })}
          optionsOpen={optionsOpen}
          onOpenOptions={openOptions}
          onCloseOptions={closeOptions}
        />

        <Board
          board={state.board}
          disabled={state.paused || optionsOpen}
          obscured={state.paused || optionsOpen}
          onOpen={(x, y) => {
            dispatch({ type: 'OPEN_CELL', x, y });
            if (!state.paused && !optionsOpen) play('click');
          }}
          onFlag={(x, y) => {
            dispatch({ type: 'TOGGLE_FLAG', x, y });
            if (!state.paused && !optionsOpen) play('flag');
          }}
        />

        <Leaderboard
          entries={leaderboard}
          onClear={() => {
            setLeaderboard([]);
            localStorage.removeItem(LEADERBOARD_KEY);
          }}
        />
      </div>

      <Modal status={state.status} timer={state.timer} onReset={() => dispatch({ type: 'RESET' })} />
    </div>
  );
};
