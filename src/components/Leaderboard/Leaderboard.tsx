import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../core/types';
import type { Messages } from '../../i18n/messages';

export interface LeaderboardEntry {
  id: string;
  difficulty: Difficulty;
  time: number;
  assists: number;
  lives: number;
  autoSolveUsed: boolean;
  createdAt: number;
}

interface Props {
  entries: LeaderboardEntry[];
  difficultyLabels: Record<Difficulty, string>;
  labels: Messages['leaderboard'];
  onClear: () => void;
}

const difficultyOrder: Difficulty[] = ['easy', 'normal', 'hard'];
const LEADERBOARD_TABLE_BASE_WIDTH = 460;
const PAGE_SIZE = 10;

export const Leaderboard = ({ entries, difficultyLabels, labels, onClear }: Props) => {
  const tableHostRef = useRef<HTMLDivElement | null>(null);
  const [tableHostWidth, setTableHostWidth] = useState(0);
  const [pageByDifficulty, setPageByDifficulty] = useState<Record<Difficulty, number>>({
    easy: 1,
    normal: 1,
    hard: 1
  });

  useEffect(() => {
    const el = tableHostRef.current;
    if (!el) return;

    const update = () => setTableHostWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const tableScale = tableHostWidth > 0 ? Math.min(1, tableHostWidth / LEADERBOARD_TABLE_BASE_WIDTH) : 1;

  return (
    <section className="mt-4 rounded-xl border border-[var(--border)] bg-white/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold sm:text-base">{labels.title}</h3>
        <button className="ui-button rounded-md px-2 py-1 text-xs" onClick={onClear}>
          {labels.clear}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-600">{labels.empty}</p>
      ) : (
        <div className="space-y-4">
          {difficultyOrder.map((difficulty) => {
            const rows = entries.filter((entry) => entry.difficulty === difficulty);
            if (rows.length === 0) return null;
            const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
            const page = Math.min(pageByDifficulty[difficulty] ?? 1, totalPages);
            const start = (page - 1) * PAGE_SIZE;
            const pageRows = rows.slice(start, start + PAGE_SIZE);

            return (
              <div key={difficulty}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">{difficultyLabels[difficulty]}</h4>
                  {totalPages > 1 ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        className="ui-button rounded px-2 py-1"
                        disabled={page <= 1}
                        onClick={() =>
                          setPageByDifficulty((prev) => ({
                            ...prev,
                            [difficulty]: 1
                          }))
                        }
                      >
                        {labels.first}
                      </button>
                      <button
                        className="ui-button rounded px-2 py-1"
                        disabled={page <= 1}
                        onClick={() =>
                          setPageByDifficulty((prev) => ({
                            ...prev,
                            [difficulty]: Math.max(1, page - 1)
                          }))
                        }
                      >
                        {labels.prev}
                      </button>
                      <span className="tabular-nums">{page}/{totalPages}</span>
                      <button
                        className="ui-button rounded px-2 py-1"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPageByDifficulty((prev) => ({
                            ...prev,
                            [difficulty]: Math.min(totalPages, page + 1)
                          }))
                        }
                      >
                        {labels.next}
                      </button>
                      <button
                        className="ui-button rounded px-2 py-1"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPageByDifficulty((prev) => ({
                            ...prev,
                            [difficulty]: totalPages
                          }))
                        }
                      >
                        {labels.last}
                      </button>
                    </div>
                  ) : null}
                </div>
                <div ref={tableHostRef} className="w-full">
                  <div
                    className="mx-auto overflow-hidden"
                    style={{
                      width: Math.round(LEADERBOARD_TABLE_BASE_WIDTH * tableScale),
                      height: Math.round((34 + pageRows.length * 37) * tableScale)
                    }}
                  >
                    <table
                      className="w-[460px] text-center text-xs sm:text-sm"
                      style={{ transform: `scale(${tableScale})`, transformOrigin: 'top left' }}
                    >
                      <thead>
                        <tr className="border-b border-[var(--border)] text-center text-xs uppercase tracking-wide text-gray-600">
                          <th className="py-2 pr-2">{labels.rank}</th>
                          <th className="py-2 pr-2">{labels.lives}</th>
                          <th className="py-2 pr-2">{labels.hints}</th>
                          <th className="py-2 pr-2">{labels.time}</th>
                          <th className="py-2 pr-2">{labels.date}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((entry, idx) => {
                          const rank = start + idx + 1;
                          return (
                            <tr
                              key={entry.id}
                            className={`border-b border-[var(--border)]/60 last:border-b-0 ${
                                entry.autoSolveUsed ? 'bg-black/10' : ''
                              }`}
                            >
                              <td className="py-2 pr-2 font-semibold">
                                {entry.autoSolveUsed ? `🤖#${rank}` : `#${rank}`}
                              </td>
                              <td className="py-2 pr-2">{entry.lives}</td>
                              <td className="py-2 pr-2">{entry.assists}</td>
                              <td className="py-2 pr-2 font-mono">{entry.time.toFixed(1)}s</td>
                              <td className="py-2 pr-2 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
