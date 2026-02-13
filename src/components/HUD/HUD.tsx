import type { GameStatus, SoundPreset, ThemeMode } from '../../core/types';

interface Props {
  status: GameStatus;
  paused: boolean;
  lives: number;
  timer: number;
  remainingMines: number;
  aiMode: boolean;
  theme: ThemeMode;
  cellSize: number;
  soundEnabled: boolean;
  soundVolume: number;
  soundPreset: SoundPreset;
  hintDisabled: boolean;
  pauseDisabled: boolean;
  autoSolveDisabled: boolean;
  labels: {
    newGame: string;
    hint: string;
    pause: string;
    resume: string;
    options: string;
    autoSolveOn: string;
    autoSolveOff: string;
    status: { idle: string; playing: string; won: string; lost: string; paused: string };
  };
  onReset: () => void;
  onToggleAI: () => void;
  onHint: () => void;
  onToggleTheme: () => void;
  onCellSizeChange: (size: number) => void;
  onTogglePause: () => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onSoundVolumeChange: (volume: number) => void;
  onSoundPresetChange: (preset: SoundPreset) => void;
  onOpenOptions: () => void;
}

const buttonClass =
  'ui-button rounded-md px-3 py-2 text-sm';

export const HUD = ({
  status,
  paused,
  lives,
  timer,
  remainingMines,
  aiMode,
  theme,
  cellSize,
  soundEnabled,
  soundVolume,
  soundPreset,
  hintDisabled,
  pauseDisabled,
  autoSolveDisabled,
  labels,
  onReset,
  onToggleAI,
  onHint,
  onToggleTheme,
  onCellSizeChange,
  onTogglePause,
  onSoundEnabledChange,
  onSoundVolumeChange,
  onSoundPresetChange,
  onOpenOptions
}: Props) => {
  const statusLabel = paused ? labels.status.paused : labels.status[status];
  const timerText = `${timer.toFixed(1)}s`;

  return (
    <div className="mb-3 grid min-w-0 gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-wrap justify-end gap-1.5 rounded-xl border border-[var(--border)] bg-white/60 p-2 sm:gap-2">
        <button className={buttonClass} onClick={onReset}>{labels.newGame}</button>
        <button className={buttonClass} onClick={onHint} disabled={hintDisabled}>{labels.hint}</button>
        <button className={buttonClass} onClick={onTogglePause} disabled={pauseDisabled}>
          {paused ? labels.resume : labels.pause}
        </button>
        <button className={buttonClass} onClick={onOpenOptions}>{labels.options}</button>
        <div className="basis-full" />
        <button
          className={`${buttonClass} ml-auto ${aiMode ? 'bg-[var(--btn-bg-active)] shadow-[inset_-1px_-1px_0_var(--btn-hi),inset_1px_1px_0_var(--btn-lo)] translate-y-[1px]' : ''}`}
          onClick={onToggleAI}
          disabled={autoSolveDisabled}
          aria-pressed={aiMode}
        >
          {aiMode ? labels.autoSolveOn : labels.autoSolveOff}
        </button>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-white/60 p-2 text-xs font-bold sm:p-3 sm:text-base">
        <span>⏱ {timerText}</span>
        <span>❤️ {lives}</span>
        <span>🚩 {remainingMines}</span>
        <span>{statusLabel}</span>
      </div>
    </div>
  );
};
