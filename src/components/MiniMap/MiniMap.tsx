import type { Board as BoardType } from '../../core/types';

interface Props {
  board: BoardType;
}

export const MiniMap = ({ board }: Props) => {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return null;

  const dense = rows > 24 || cols > 18;
  const gap = dense ? 0 : 1;
  const maxWidth = 128;
  const maxHeight = 170;
  const cellSize = Math.max(2, Math.floor(Math.min(maxWidth / cols, maxHeight / rows)));

  const cellBg = (cell: BoardType[number][number]): string => {
    if (cell.isOpen && cell.isMine) return 'var(--mine)';
    if (cell.isOpen) return 'var(--open)';
    if (cell.isFlagged) return 'var(--mine)';
    return 'var(--closed)';
  };

  return (
    <div className="shrink-0 rounded-lg border border-[var(--border)] bg-white/75 px-2 py-1.5">
      <div className="flex justify-center">
        <div
          className="grid"
          style={{
            gap: `${gap}px`,
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`
          }}
          aria-label="board-minimap"
        >
          {board.flat().map((cell) => (
            <div
              key={`minimap-${cell.x}-${cell.y}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                background: cellBg(cell),
                opacity: cell.isOpen ? 0.95 : cell.isFlagged ? 0.9 : 0.75
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
