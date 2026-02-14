import { useEffect, useRef, useState } from 'react';
import type { Cell as CellType } from '../../core/types';
import styles from './Cell.module.css';

interface Props {
  cell: CellType;
  obscured?: boolean;
  highlighted?: boolean;
  pressed?: boolean;
  mineProbability?: number;
  interactionMode?: 'open' | 'flag';
  enableLongPressHaptics?: boolean;
  onPressStart?: (x: number, y: number) => void;
  onPressEnd?: () => void;
  onOpen: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => boolean;
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
  mineProbability,
  interactionMode = 'open',
  enableLongPressHaptics = false,
  onPressStart,
  onPressEnd,
  onOpen,
  onFlag
}: Props) => {
  const touchTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const suppressContextMenuRef = useRef(false);
  const prevFlaggedRef = useRef(cell.isFlagged);
  const [flagBurstToken, setFlagBurstToken] = useState(0);
  const [showFlagBurst, setShowFlagBurst] = useState(false);
  const isClosedLike = obscured || !cell.isOpen;

  useEffect(() => {
    if (!obscured && !prevFlaggedRef.current && cell.isFlagged) {
      setFlagBurstToken((v) => v + 1);
      setShowFlagBurst(true);
    }
    prevFlaggedRef.current = cell.isFlagged;
  }, [cell.isFlagged, obscured]);

  const className = [
    'relative isolate grid place-items-center overflow-visible rounded-none p-0 font-bold transition-transform duration-100',
    showFlagBurst ? 'z-30' : 'z-0',
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
    !obscured && cell.isExploded ? 'bg-[var(--exploded-bg)] animate-pulse ring-2 ring-white/90 ring-inset' : '',
    !obscured && highlighted ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-transparent' : ''
  ]
    .filter(Boolean)
    .join(' ');

  let label = '';
  if (!obscured) {
    if (cell.isFlagged && !cell.isOpen) label = '🚩';
    else if (cell.isOpen && cell.isMine) label = '💣';
    else if (cell.isOpen && cell.adjacentMines > 0) label = String(cell.adjacentMines);
    else if (!cell.isOpen && !cell.isFlagged && typeof mineProbability === 'number') label = `${mineProbability}%`;
  }

  const clearTouchTimer = () => {
    if (touchTimerRef.current != null) {
      window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  useEffect(() => clearTouchTimer, []);
  useEffect(() => {
    if (obscured) clearTouchTimer();
  }, [obscured]);

  const numberColor = !obscured && cell.isOpen ? numberClass(cell.adjacentMines) : '';
  const vibrate = () => {
    if (!enableLongPressHaptics || typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    navigator.vibrate(20);
  };

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
        if (interactionMode === 'flag') {
          if (!cell.isOpen) {
            onFlag(cell.x, cell.y);
          }
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
        if (suppressContextMenuRef.current) {
          suppressContextMenuRef.current = false;
          return;
        }
        onFlag(cell.x, cell.y);
      }}
      onTouchStart={() => {
        if (obscured) return;
        onPressStart?.(cell.x, cell.y);
        if (interactionMode === 'flag') return;
        if (cell.isOpen) return;
        clearTouchTimer();
        touchTimerRef.current = window.setTimeout(() => {
          suppressClickRef.current = true;
          suppressContextMenuRef.current = true;
          const changed = onFlag(cell.x, cell.y);
          if (changed) vibrate();
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
      {showFlagBurst ? (
        <span className={styles.flagBurstWrap} aria-hidden="true">
          <span
            key={`flag-burst-${flagBurstToken}`}
            className={styles.flagBurstWave}
            onAnimationEnd={() => setShowFlagBurst(false)}
          />
          <span key={`flag-core-${flagBurstToken}`} className={styles.flagBurstCore} />
        </span>
      ) : null}
      <span className={`relative z-[1] ${!cell.isOpen && !cell.isFlagged && typeof mineProbability === 'number' ? 'text-[10px]' : ''}`}>{label}</span>
    </button>
  );
};
