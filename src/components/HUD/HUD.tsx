import type { GameStatus } from '../../core/types';

interface Props {
  status: GameStatus;
  paused: boolean;
  lives: number;
  timer: number;
  remainingMines: number;
  aiMode: boolean;
  aiSpeed: 1 | 2 | 4 | 8 | 16;
  pauseDisabled: boolean;
  autoSolveDisabled: boolean;
  showProbabilities: boolean;
  hideStatus?: boolean;
  hideOptionsButton?: boolean;
  hidePrimaryControls?: boolean;
  labels: {
    newGame: string;
    probability: string;
    pause: string;
    resume: string;
    options: string;
    autoSolveOn: string;
    autoSolveOff: string;
    status: { idle: string; playing: string; won: string; lost: string; paused: string };
  };
  onReset: () => void;
  onToggleAI: () => void;
  onAiSpeedChange: (speed: 1 | 2 | 4 | 8 | 16) => void;
  onToggleProbabilities: () => void;
  onTogglePause: () => void;
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
  aiSpeed,
  pauseDisabled,
  autoSolveDisabled,
  showProbabilities,
  hideStatus = false,
  hideOptionsButton = false,
  hidePrimaryControls = false,
  labels,
  onReset,
  onToggleAI,
  onAiSpeedChange,
  onToggleProbabilities,
  onTogglePause,
  onOpenOptions
}: Props) => {
  return (
    <div className="mb-3 grid min-w-0 gap-2 sm:gap-3">
      {hidePrimaryControls ? null : (
        <div className="flex min-w-0 flex-wrap justify-end gap-1.5 rounded-xl border border-[var(--border)] bg-white/60 p-2 sm:gap-2">
          <button className={buttonClass} onClick={onReset}>{labels.newGame}</button>
          <button className={buttonClass} onClick={onTogglePause} disabled={pauseDisabled}>
            {paused ? labels.resume : labels.pause}
          </button>
          {hideOptionsButton ? null : <button className={buttonClass} onClick={onOpenOptions}>{labels.options}</button>}
        </div>
      )}
      <div className="flex min-w-0 flex-wrap items-start justify-end gap-1.5 rounded-xl border border-[var(--border)] bg-white/60 p-2 sm:gap-2">
        <div className="relative inline-flex flex-col items-end">
          <button
            className={`${buttonClass} ml-auto ${aiMode ? 'bg-[var(--btn-bg-active)] shadow-[inset_-1px_-1px_0_var(--btn-hi),inset_1px_1px_0_var(--btn-lo)] translate-y-[1px]' : ''}`}
            onClick={onToggleAI}
            disabled={autoSolveDisabled}
            aria-pressed={aiMode}
          >
            {aiMode ? labels.autoSolveOn : labels.autoSolveOff}
          </button>
          {aiMode ? (
            <div className="mt-1 inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white/70 px-2 py-1 text-xs">
              {[1, 2, 4, 8, 16].map((speed) => (
                <button
                  key={speed}
                  className={`rounded px-1.5 py-0.5 ${aiSpeed === speed ? 'bg-[var(--btn-bg-active)] font-semibold' : ''}`}
                  onClick={() => onAiSpeedChange(speed as 1 | 2 | 4 | 8 | 16)}
                  aria-pressed={aiSpeed === speed}
                >
                  x{speed}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          className={`${buttonClass} ${showProbabilities ? 'bg-[var(--btn-bg-active)] shadow-[inset_-1px_-1px_0_var(--btn-hi),inset_1px_1px_0_var(--btn-lo)] translate-y-[1px]' : ''}`}
          onClick={onToggleProbabilities}
          aria-pressed={showProbabilities}
        >
          {labels.probability}
        </button>
      </div>

      {hideStatus ? null : (
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-white/60 p-2 text-xs font-bold sm:p-3 sm:text-base">
          <span>⏱ {`${timer.toFixed(1)}s`}</span>
          <span>❤️ {lives}</span>
          <span>🚩 {remainingMines}</span>
          <span>{paused ? labels.status.paused : labels.status[status]}</span>
        </div>
      )}
    </div>
  );
};
