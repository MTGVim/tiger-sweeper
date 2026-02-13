import type { GameStatus, SoundPreset, ThemeMode } from '../../core/types';

interface Props {
  status: GameStatus;
  paused: boolean;
  timer: number;
  remainingMines: number;
  aiMode: boolean;
  theme: ThemeMode;
  cellSize: number;
  soundEnabled: boolean;
  soundVolume: number;
  soundPreset: SoundPreset;
  onReset: () => void;
  onToggleAI: () => void;
  onAiStep: () => void;
  onToggleTheme: () => void;
  onCellSizeChange: (size: number) => void;
  onTogglePause: () => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onSoundVolumeChange: (volume: number) => void;
  onSoundPresetChange: (preset: SoundPreset) => void;
  optionsOpen: boolean;
  onOpenOptions: () => void;
  onCloseOptions: () => void;
}

const buttonClass =
  'ui-button rounded-md px-3 py-2 text-sm';

export const HUD = ({
  status,
  paused,
  timer,
  remainingMines,
  aiMode,
  theme,
  cellSize,
  soundEnabled,
  soundVolume,
  soundPreset,
  onReset,
  onToggleAI,
  onAiStep,
  onToggleTheme,
  onCellSizeChange,
  onTogglePause,
  onSoundEnabledChange,
  onSoundVolumeChange,
  onSoundPresetChange,
  optionsOpen,
  onOpenOptions,
  onCloseOptions
}: Props) => {
  const statusLabel = paused ? 'PAUSED' : status.toUpperCase();

  return (
    <div className="mb-3 grid gap-2 sm:grid-cols-2 sm:gap-3">
      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white/60 p-3 text-sm font-bold sm:text-base">
        <span>⏱ {timer}s</span>
        <span>🚩 {remainingMines}</span>
        <span>{statusLabel}</span>
      </div>

      <div className="flex flex-wrap justify-start gap-2 rounded-xl border border-[var(--border)] bg-white/60 p-2 sm:justify-end">
        <button className={buttonClass} onClick={onAiStep}>AI Step</button>
        <button className={buttonClass} onClick={onTogglePause}>{paused ? 'Resume' : 'Pause'}</button>
        <button className={buttonClass} onClick={onOpenOptions}>Options</button>
      </div>

      {optionsOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-3">
          <div className="w-full max-w-[560px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[0_14px_40px_rgb(0_0_0_/_16%)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Options</h3>
              <button className={buttonClass} onClick={onCloseOptions}>Close</button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button className={buttonClass} onClick={onReset}>New Game</button>
              <button className={buttonClass} onClick={onToggleAI}>{aiMode ? 'AI: ON' : 'AI: OFF'}</button>
              <button className={buttonClass} onClick={onToggleTheme}>
                {theme === 'modern' ? 'XP Theme' : 'Modern Theme'}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <label htmlFor="cell-size" className="text-sm font-semibold">Cell Size</label>
              <span className="text-sm tabular-nums">{cellSize}px</span>
            </div>
            <input
              id="cell-size"
              type="range"
              min={18}
              max={40}
              step={1}
              value={cellSize}
              onChange={(e) => onCellSizeChange(Number(e.target.value))}
              className="mt-2 w-full"
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <label htmlFor="sound-enabled" className="text-sm font-semibold">Sound</label>
              <input
                id="sound-enabled"
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => onSoundEnabledChange(e.target.checked)}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <label htmlFor="sound-preset" className="text-sm font-semibold">Preset</label>
              <select
                id="sound-preset"
                className="rounded border border-[var(--border)] bg-white px-2 py-1 text-sm"
                value={soundPreset}
                onChange={(e) => onSoundPresetChange(e.target.value as SoundPreset)}
              >
                <option value="soft">Soft</option>
                <option value="retro">Retro</option>
                <option value="arcade">Arcade</option>
              </select>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <label htmlFor="sound-volume" className="text-sm font-semibold">Volume</label>
              <span className="text-sm tabular-nums">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              id="sound-volume"
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(soundVolume * 100)}
              onChange={(e) => onSoundVolumeChange(Number(e.target.value) / 100)}
              className="mt-2 w-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
