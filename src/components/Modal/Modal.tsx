import type { GameStatus } from '../../core/types';

interface Props {
  status: GameStatus;
  timer: number;
  onReset: () => void;
}

export const Modal = ({ status, timer, onReset }: Props) => {
  if (status !== 'won' && status !== 'lost') return null;

  const title = status === 'won' ? 'You Win' : 'Game Over';
  const text = status === 'won' ? `Clear time: ${timer}s` : 'A mine exploded.';

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/45 p-3">
      <div className="w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-xl font-bold">{title}</h2>
        <p className="text-sm text-gray-700">{text}</p>
        <button
          className="ui-button mt-3 rounded-md px-3 py-2 text-sm font-semibold"
          onClick={onReset}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
