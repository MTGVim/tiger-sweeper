import type { Difficulty } from '../../core/types';

interface Props {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

export const DifficultySelector = ({ difficulty, onChange }: Props) => {
  return (
    <div className="mb-3 flex items-center gap-2">
      <label htmlFor="difficulty" className="text-sm font-semibold">Difficulty</label>
      <select
        id="difficulty"
        className="rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-sm"
        value={difficulty}
        onChange={(e) => onChange(e.target.value as Difficulty)}
      >
        <option value="easy">Easy (9x9 / 10)</option>
        <option value="normal">Normal (16x16 / 40)</option>
        <option value="hard">Hard (30x16 / 99)</option>
      </select>
    </div>
  );
};
