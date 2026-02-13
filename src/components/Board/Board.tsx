import { Cell } from '../Cell/Cell';
import type { Board as BoardType } from '../../core/types';

interface Props {
  board: BoardType;
  disabled?: boolean;
  obscured?: boolean;
  onOpen: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
}

export const Board = ({ board, disabled = false, obscured = false, onOpen, onFlag }: Props) => {
  const width = board[0]?.length ?? 0;

  return (
    <div className="relative w-full overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
      <div
        className={`mx-auto grid w-fit select-none gap-[2px] rounded-lg border border-[var(--border)] bg-[var(--grid-bg)] p-1 touch-pan-x touch-pan-y ${disabled ? 'pointer-events-none opacity-80' : ''}`}
        style={{ gridTemplateColumns: `repeat(${width}, var(--cell-size))` }}
      >
        {board.flat().map((cell) => (
          <Cell key={`${cell.x}-${cell.y}`} cell={cell} obscured={obscured} onOpen={onOpen} onFlag={onFlag} />
        ))}
      </div>
      {obscured ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="rounded-lg border border-[var(--border)] bg-black/55 px-4 py-2 text-sm font-semibold text-white">
            Paused
          </div>
        </div>
      ) : null}
    </div>
  );
};
