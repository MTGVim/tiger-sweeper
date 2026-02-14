import type { GameStatus } from '../../core/types';

interface Props {
  status: GameStatus;
  canUndo: boolean;
  lives: number;
  timer: number;
  remainingMines: number;
  aiMode: boolean;
  aiSpeed: 1 | 2 | 4 | 8 | 16;
  autoSolveDisabled: boolean;
  showProbabilities: boolean;
  hideStatus?: boolean;
  hideOptionsButton?: boolean;
  hidePrimaryControls?: boolean;
  labels: {
    newGame: string;
    probability: string;
    undo: string;
    options: string;
    autoSolveOn: string;
    autoSolveOff: string;
    status: { idle: string; playing: string; won: string; lost: string };
  };
  onReset: () => void;
  onToggleAI: () => void;
  onAiSpeedChange: (speed: 1 | 2 | 4 | 8 | 16) => void;
  onToggleProbabilities: () => void;
  onUndo: () => void;
  onOpenOptions: () => void;
}

const buttonClass = 'ui-button inline-flex h-10 items-center rounded-md px-4 text-sm';

export const HUD = ({
  status,
  canUndo,
  lives,
  timer,
  remainingMines,
  aiMode,
  aiSpeed,
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
  onUndo,
  onOpenOptions
}: Props) => {
  return (
    <div className="mb-3 grid min-w-0 gap-2 sm:gap-3">
      {hidePrimaryControls ? null : (
        <div className="flex min-w-0 flex-wrap justify-end gap-1.5 rounded-xl border border-[var(--border)] bg-white/60 p-2 sm:gap-2">
          <button className={buttonClass} onClick={onReset}>{labels.newGame}</button>
          <button className={buttonClass} onClick={onUndo} disabled={!canUndo}>
            {labels.undo}
          </button>
          {hideOptionsButton ? null : <button className={buttonClass} onClick={onOpenOptions}>{labels.options}</button>}
        </div>
      )}
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 rounded-xl border border-[var(--border)] bg-white/60 p-2 sm:gap-2">
        {aiMode ? (
          <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white/70 px-2 py-1 text-xs">
            {[1, 4, 16].map((speed) => (
              <button
                key={speed}
                className={`ui-button inline-flex h-7 min-w-8 items-center justify-center rounded px-1.5 text-[11px] leading-none ${aiSpeed === speed ? 'bg-[var(--btn-bg-active)] font-semibold translate-y-[1px]' : ''}`}
                onClick={() => onAiSpeedChange(speed as 1 | 2 | 4 | 8 | 16)}
                aria-pressed={aiSpeed === speed}
              >
                x{speed}
              </button>
            ))}
          </div>
        ) : null}
        <div className="inline-flex items-center">
          <button
            className={`${buttonClass} ${aiMode ? 'bg-[var(--btn-bg-active)] shadow-[inset_-1px_-1px_0_var(--btn-hi),inset_1px_1px_0_var(--btn-lo)] translate-y-[1px]' : ''}`}
            onClick={onToggleAI}
            disabled={autoSolveDisabled}
            aria-pressed={aiMode}
          >
            {aiMode ? labels.autoSolveOn : labels.autoSolveOff}
          </button>
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
          <span>{labels.status[status]}</span>
        </div>
      )}
    </div>
  );
};
