import type { Difficulty } from '../../core/types';

interface Props {
  difficulty: Difficulty;
  label: string;
  labels: Record<Difficulty, string>;
  onChange: (difficulty: Difficulty) => void;
}

export const DifficultySelector = ({ difficulty, label, labels, onChange }: Props) => {
  const tabClass = (value: Difficulty): string =>
    `ui-button rounded-md px-3 py-1.5 text-sm ${
      difficulty === value ? 'bg-[var(--btn-bg-active)] ring-1 ring-[var(--btn-lo)]' : ''
    }`;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="inline-flex flex-wrap gap-2" role="tablist" aria-label="Difficulty Tabs">
        <button className={tabClass('easy')} role="tab" aria-selected={difficulty === 'easy'} onClick={() => onChange('easy')}>
          {labels.easy}
        </button>
        <button className={tabClass('normal')} role="tab" aria-selected={difficulty === 'normal'} onClick={() => onChange('normal')}>
          {labels.normal}
        </button>
        <button className={tabClass('hard')} role="tab" aria-selected={difficulty === 'hard'} onClick={() => onChange('hard')}>
          {labels.hard}
        </button>
        <button
          className={tabClass('veryHard')}
          role="tab"
          aria-selected={difficulty === 'veryHard'}
          onClick={() => onChange('veryHard')}
        >
          {labels.veryHard}
        </button>
      </div>
    </div>
  );
};
