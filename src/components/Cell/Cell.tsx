import { useRef } from 'react';
import type { Cell as CellType } from '../../core/types';

interface Props {
  cell: CellType;
  obscured?: boolean;
  highlighted?: boolean;
  pressed?: boolean;
  onPressStart?: (x: number, y: number) => void;
  onPressEnd?: () => void;
  onOpen: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
}

const numberClass = (n: number): string => {
  if (n === 1) return '#0000ff';
  if (n === 2) return '#008200';
  if (n === 3) return '#ff0000';
  if (n === 4) return '#000084';
  if (n === 5) return '#840000';
  if (n === 6) return '#008284';
  if (n === 7) return '#000000';
  if (n === 8) return '#7b7b7b';
  return '';
};

export const Cell = ({
  cell,
  obscured = false,
  highlighted = false,
  pressed = false,
  onPressStart,
  onPressEnd,
  onOpen,
  onFlag
}: Props) => {
  const touchTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const isClosedLike = obscured || !cell.isOpen;

  const className = [
    'grid place-items-center rounded-[4px] p-0 font-bold transition-transform duration-100',
    isClosedLike
      ? 'ui-button text-[color:var(--cell-text-closed)]'
      : 'cursor-default border border-[var(--cell-border)] bg-[var(--open)] text-[color:var(--cell-text-open)]',
    !obscured && !cell.isOpen ? 'cursor-pointer' : '',
    !obscured && isClosedLike ? 'active:scale-95' : '',
    !obscured && pressed && isClosedLike ? 'scale-95' : '',
    !obscured && pressed && isClosedLike
      ? 'bg-[var(--btn-bg-active)] shadow-[inset_-1px_-1px_0_var(--btn-hi),inset_1px_1px_0_var(--btn-lo)]'
      : '',
    !obscured && pressed && !isClosedLike ? 'brightness-95' : '',
    !obscured && cell.isMine && cell.isOpen ? 'bg-[var(--mine)] text-white' : '',
    !obscured && cell.isExploded ? 'animate-pulse ring-2 ring-white/90 ring-inset' : '',
    !obscured && highlighted ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-transparent' : ''
  ]
    .filter(Boolean)
    .join(' ');

  let label = '';
  if (!obscured) {
    if (cell.isFlagged && !cell.isOpen) label = '🚩';
    else if (cell.isOpen && cell.isMine) label = '💣';
    else if (cell.isOpen && cell.adjacentMines > 0) label = String(cell.adjacentMines);
  }

  const clearTouchTimer = () => {
    if (touchTimerRef.current != null) {
      window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const numberColor = !obscured && cell.isOpen ? numberClass(cell.adjacentMines) : '';

  return (
    <button
      className={className}
      style={{
        width: 'var(--cell-size)',
        height: 'var(--cell-size)',
        fontSize: 'var(--cell-font-size)',
        color: numberColor || undefined
      }}
      onClick={() => {
        if (obscured) return;
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onOpen(cell.x, cell.y);
      }}
      onMouseDown={() => {
        if (obscured) return;
        onPressStart?.(cell.x, cell.y);
      }}
      onMouseUp={() => onPressEnd?.()}
      onMouseLeave={() => onPressEnd?.()}
      onContextMenu={(e) => {
        e.preventDefault();
        if (obscured) return;
        onFlag(cell.x, cell.y);
      }}
      onTouchStart={() => {
        if (obscured) return;
        onPressStart?.(cell.x, cell.y);
        if (cell.isOpen) return;
        clearTouchTimer();
        touchTimerRef.current = window.setTimeout(() => {
          suppressClickRef.current = true;
          onFlag(cell.x, cell.y);
        }, 350);
      }}
      onTouchEnd={() => {
        clearTouchTimer();
        onPressEnd?.();
      }}
      onTouchMove={() => {
        clearTouchTimer();
        onPressEnd?.();
      }}
      onTouchCancel={() => {
        clearTouchTimer();
        onPressEnd?.();
      }}
      aria-label={`cell-${cell.x}-${cell.y}`}
    >
      {label}
    </button>
  );
};
