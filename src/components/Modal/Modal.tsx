import type { GameStatus } from '../../core/types';

interface Props {
  open: boolean;
  status: GameStatus;
  timer: number;
  onReset: () => void;
  onConfirm: () => void;
}

export const Modal = ({ open, status, timer, onReset, onConfirm }: Props) => {
  if (!open || (status !== 'won' && status !== 'lost')) return null;

  const title = status === 'won' ? 'You Win' : 'Game Over';
  const text = status === 'won' ? `Clear time: ${timer.toFixed(1)}s` : 'A mine exploded.';

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/45 p-3">
      <div className="w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-xl font-bold">{title}</h2>
        <p className="text-sm text-gray-700">{text}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="ui-button rounded-md px-3 py-2 text-sm font-semibold" onClick={onReset}>
            다시하기
          </button>
          <button className="ui-button rounded-md px-3 py-2 text-sm font-semibold" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
