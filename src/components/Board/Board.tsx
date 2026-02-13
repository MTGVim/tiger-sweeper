import { Cell } from '../Cell/Cell';
import type { Board as BoardType } from '../../core/types';

interface Props {
  board: BoardType;
  cellSize: number;
  boardScale?: number;
  disabled?: boolean;
  obscured?: boolean;
  pausedLabel?: string;
  noticeMessage?: string | null;
  hintCell?: { x: number; y: number } | null;
  pressedCells?: Set<string>;
  probabilityHints?: Map<string, number>;
  onPressStart?: (x: number, y: number) => void;
  onPressEnd?: () => void;
  onOpen: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
}

export const Board = ({
  board,
  cellSize,
  boardScale = 1,
  disabled = false,
  obscured = false,
  pausedLabel = 'Paused',
  noticeMessage = null,
  hintCell = null,
  pressedCells = new Set<string>(),
  probabilityHints = new Map<string, number>(),
  onPressStart,
  onPressEnd,
  onOpen,
  onFlag
}: Props) => {
  const height = board.length;
  const width = board[0]?.length ?? 0;
  const gridGap = 1;
  const boardPixelWidth = width * cellSize + Math.max(0, width - 1) * gridGap + 10;
  const boardPixelHeight = height * cellSize + Math.max(0, height - 1) * gridGap + 10;
  const scaledWidth = Math.max(1, Math.round(boardPixelWidth * boardScale));
  const scaledHeight = Math.max(1, Math.round(boardPixelHeight * boardScale));

  return (
    <div className="w-full max-w-full pb-1">
      <div className="relative mx-auto" style={{ width: scaledWidth, height: scaledHeight }}>
        <div
          style={{
            width: boardPixelWidth,
            transform: `scale(${boardScale})`,
            transformOrigin: 'top left'
          }}
        >
          <div
            className={`grid w-fit select-none gap-[1px] rounded-lg border border-[var(--border)] bg-[var(--grid-bg)] p-1 touch-manipulation ${disabled ? 'pointer-events-none opacity-80' : ''}`}
            style={{ gridTemplateColumns: `repeat(${width}, var(--cell-size))` }}
          >
            {board.flat().map((cell) => (
              <Cell
                key={`${cell.x}-${cell.y}`}
                cell={cell}
                obscured={obscured}
                highlighted={hintCell?.x === cell.x && hintCell?.y === cell.y}
                pressed={pressedCells.has(`${cell.x},${cell.y}`)}
                mineProbability={probabilityHints.get(`${cell.x},${cell.y}`)}
                onPressStart={onPressStart}
                onPressEnd={onPressEnd}
                onOpen={onOpen}
                onFlag={onFlag}
              />
            ))}
          </div>
        </div>
        {obscured ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="rounded-lg border border-[var(--border)] bg-black/55 px-4 py-2 text-sm font-semibold text-white">
              {pausedLabel}
            </div>
          </div>
        ) : null}
        {!obscured && noticeMessage ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="rounded-lg border border-[var(--border)] bg-black/55 px-4 py-2 text-sm font-semibold text-white">
              {noticeMessage}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
