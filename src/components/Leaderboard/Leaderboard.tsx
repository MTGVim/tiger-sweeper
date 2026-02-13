import type { Difficulty } from '../../core/types';

export interface LeaderboardEntry {
  id: string;
  difficulty: Difficulty;
  time: number;
  createdAt: number;
}

interface Props {
  entries: LeaderboardEntry[];
  onClear: () => void;
}

const difficultyLabel: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard'
};

export const Leaderboard = ({ entries, onClear }: Props) => {
  return (
    <section className="mt-4 rounded-xl border border-[var(--border)] bg-white/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold sm:text-base">Leaderboard (Local)</h3>
        <button
          className="ui-button rounded-md px-2 py-1 text-xs"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-600">No records yet. Win a game to create your first record.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-gray-600">
                <th className="py-2 pr-2">Rank</th>
                <th className="py-2 pr-2">Difficulty</th>
                <th className="py-2 pr-2">Time</th>
                <th className="py-2 pr-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.id} className="border-b border-[var(--border)]/60 last:border-b-0">
                  <td className="py-2 pr-2 font-semibold">#{idx + 1}</td>
                  <td className="py-2 pr-2">{difficultyLabel[entry.difficulty]}</td>
                  <td className="py-2 pr-2 font-mono">{entry.time}s</td>
                  <td className="py-2 pr-2 text-xs sm:text-sm">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
