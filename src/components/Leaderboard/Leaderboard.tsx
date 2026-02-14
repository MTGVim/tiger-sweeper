import { useState } from 'react';
import type { Difficulty } from '../../core/types';
import type { Messages } from '../../i18n/messages';

export interface LeaderboardEntry {
  id: string;
  difficulty: Difficulty;
  time: number;
  assists: number;
  lives: number;
  autoSolveUsed: boolean;
  probabilityAssistUsed: boolean;
  createdAt: number;
}

interface Props {
  entries: LeaderboardEntry[];
  difficultyLabels: Record<Difficulty, string>;
  labels: Messages['leaderboard'];
  onClear: () => void;
}

const difficultyOrder: Difficulty[] = ['easy', 'normal', 'hard'];
const PAGE_SIZE = 10;
type ModeFilter = 'none' | 'assist' | 'probability' | 'both';

const formatLeaderboardDate = (createdAt: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(createdAt));

export const Leaderboard = ({ entries, difficultyLabels, labels, onClear }: Props) => {
  const [modeFilter, setModeFilter] = useState<ModeFilter>('none');
  const [collapsed, setCollapsed] = useState(true);
  const [pageByDifficulty, setPageByDifficulty] = useState<Record<Difficulty, number>>({
    easy: 1,
    normal: 1,
    hard: 1
  });
  const filteredEntries = entries.filter((entry) => {
    if (modeFilter === 'both') return entry.autoSolveUsed && entry.probabilityAssistUsed;
    if (modeFilter === 'assist') return entry.autoSolveUsed && !entry.probabilityAssistUsed;
    if (modeFilter === 'probability') return !entry.autoSolveUsed && entry.probabilityAssistUsed;
    return !entry.autoSolveUsed && !entry.probabilityAssistUsed;
  });

  return (
    <section className="mt-4 min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-white/70 px-2 py-3">
      <div className={`${collapsed ? 'mb-0' : 'mb-3'} flex flex-wrap items-center justify-between gap-2`}>
        <h3 className="min-w-0 text-sm font-bold sm:text-base">{labels.title}</h3>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {!collapsed ? (
            <button className="ui-button rounded-md px-2 py-1 text-xs" onClick={onClear}>
              {labels.clear}
            </button>
          ) : null}
          <button
            className="ui-button rounded-md px-2 py-1 text-xs"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle leaderboard"
            aria-expanded={!collapsed}
          >
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {collapsed ? null : (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
            {(
              [
                ['none', labels.modeNone],
                ['assist', labels.modeAssist],
                ['probability', labels.modeProbability],
                ['both', labels.modeBoth]
              ] as Array<[ModeFilter, string]>
            ).map(([mode, text]) => (
              <button
                key={mode}
                className={`ui-button rounded px-2 py-1 ${modeFilter === mode ? 'bg-[var(--btn-bg-active)]' : ''}`}
                onClick={() => setModeFilter(mode)}
                aria-pressed={modeFilter === mode}
              >
                {text}
              </button>
            ))}
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-sm text-gray-600">{labels.empty}</p>
          ) : (
            <div className="space-y-4">
              {difficultyOrder.map((difficulty) => {
                const rows = filteredEntries.filter((entry) => entry.difficulty === difficulty);
                if (rows.length === 0) return null;
                const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
                const page = Math.min(pageByDifficulty[difficulty] ?? 1, totalPages);
                const start = (page - 1) * PAGE_SIZE;
                const pageRows = rows.slice(start, start + PAGE_SIZE);

                return (
                  <div key={difficulty}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold">{difficultyLabels[difficulty]}</h4>
                      {totalPages > 1 ? (
                        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5 text-xs">
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
                          <span className="tabular-nums">
                            {page}/{totalPages}
                          </span>
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
                    <div className="w-full">
                      <div className="mx-auto w-full max-w-[460px] overflow-x-auto">
                        <table className="w-full table-fixed text-center text-[11px] sm:text-sm">
                          <thead>
                            <tr className="border-b border-[var(--border)] text-center text-[10px] uppercase tracking-wide text-gray-600 sm:text-xs">
                              <th className="w-[24%] px-1 py-2 sm:px-2">{labels.rank}</th>
                              <th className="w-[16%] px-1 py-2 sm:px-2">{labels.lives}</th>
                              <th className="w-[24%] px-1 py-2 sm:px-2">{labels.time}</th>
                              <th className="w-[36%] px-1 py-2 sm:px-2">{labels.date}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageRows.map((entry, idx) => {
                              const rank = start + idx + 1;
                              return (
                                <tr
                                  key={entry.id}
                                  className={`border-b border-[var(--border)]/60 last:border-b-0 ${
                                    entry.autoSolveUsed || entry.probabilityAssistUsed ? 'bg-black/10' : ''
                                  }`}
                                >
                                  <td className="px-1 py-2 font-semibold sm:px-2">
                                    {`${entry.probabilityAssistUsed ? '👀' : ''}${entry.autoSolveUsed ? '🤖' : ''}#${rank}`}
                                  </td>
                                  <td className="px-1 py-2 sm:px-2">{entry.lives}</td>
                                  <td className="px-1 py-2 font-mono sm:px-2">{entry.time.toFixed(1)}s</td>
                                  <td className="px-1 py-2 font-mono whitespace-nowrap sm:px-2">
                                    {formatLeaderboardDate(entry.createdAt)}
                                  </td>
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
        </>
      )}
    </section>
  );
};
