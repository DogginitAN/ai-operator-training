'use client';
import { useState } from 'react';
import { StickyNote, PenLine, Sparkles, ExternalLink, X, Pin } from 'lucide-react';
import type { Jotting, Session } from '@/lib/store';

interface Props {
  studentJottings: Jotting[];
  coachJottings: Jotting[];
  sessions: Session[];
  onAdd: (jotting: Jotting) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function JottingCard({
  jotting,
  sessions,
  onDelete,
}: {
  jotting: Jotting;
  sessions: Session[];
  onDelete?: (id: string) => void;
}) {
  const pinSession = jotting.pinnedTo
    ? sessions.find(s => s.id === jotting.pinnedTo)
    : null;

  return (
    <div className="bg-white dark:bg-night-800 rounded-xl border border-surface-200 dark:border-night-600 p-4 shadow-card group relative">
      {pinSession && (
        <div className="flex items-center gap-1 mb-2">
          <Pin size={10} className="text-amber-400" />
          <span className="text-[10px] font-mono font-semibold text-amber-500 dark:text-amber-400">
            {pinSession.title}
          </span>
        </div>
      )}
      <p className="text-sm text-surface-800 dark:text-night-100 leading-relaxed pr-6">
        {jotting.text}
      </p>
      {jotting.url && (
        <a
          href={jotting.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-500 dark:text-brand-400 hover:underline"
        >
          <ExternalLink size={11} />
          <span className="truncate">{jotting.url}</span>
        </a>
      )}
      <p className="text-[10px] font-mono text-surface-300 dark:text-night-500 mt-2">
        {formatDate(jotting.createdAt)}
      </p>
      {onDelete && (
        <button
          onClick={() => onDelete(jotting.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-lg text-surface-300 hover:text-red-500 dark:text-night-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default function JottingsBoard({
  studentJottings,
  coachJottings,
  sessions,
  onAdd,
  onDelete,
}: Props) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [pinnedTo, setPinnedTo] = useState<string>('');

  const unlocked = sessions.filter(s => s.status !== 'locked');

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const jotting: Jotting = {
      id: `sj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: 'student',
      text: trimmed,
      url: url.trim() || undefined,
      pinnedTo: pinnedTo || undefined,
      createdAt: new Date().toISOString(),
    };
    onAdd(jotting);
    setText('');
    setUrl('');
    setPinnedTo('');
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-night-100">Jottings</h2>
        <p className="text-sm text-surface-300 dark:text-night-400 mt-1">
          Quick notes, links, and ideas — yours and Andrew's.
        </p>
      </div>

      {/* Two-lane layout */}
      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">

        {/* ── Your Notes lane ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StickyNote size={14} className="text-amber-500" />
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-surface-400 dark:text-night-400">
              Your Notes
            </h3>
            <span className="text-[10px] font-mono text-surface-300 dark:text-night-500">
              {studentJottings.length}
            </span>
          </div>

          {/* Add form */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Jot something down…"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-night-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-surface-900 dark:text-night-100 placeholder-surface-300 dark:placeholder-night-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex gap-2">
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Link (optional)"
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-night-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-surface-900 dark:text-night-100 placeholder-surface-300 dark:placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <select
                value={pinnedTo}
                onChange={e => setPinnedTo(e.target.value)}
                className="px-3 py-2 text-sm bg-white dark:bg-night-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-surface-900 dark:text-night-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">No pin</option>
                {unlocked.map(s => (
                  <option key={s.id} value={s.id}>
                    S{s.number}: {s.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!text.trim()}
              className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <PenLine size={14} />
              Add Note
            </button>
          </div>

          {/* Student jottings list */}
          {studentJottings.length === 0 ? (
            <p className="text-sm text-surface-300 dark:text-night-400 italic px-1">
              No notes yet.
            </p>
          ) : (
            <div className="space-y-2">
              {[...studentJottings].reverse().map(j => (
                <JottingCard key={j.id} jotting={j} sessions={sessions} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>

        {/* ── Andrew's Notes lane ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-500" />
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-surface-400 dark:text-night-400">
              Andrew's Notes
            </h3>
            <span className="text-[10px] font-mono text-surface-300 dark:text-night-500">
              {coachJottings.length}
            </span>
          </div>

          {coachJottings.length === 0 ? (
            <p className="text-sm text-surface-300 dark:text-night-400 italic px-1">
              No notes yet.
            </p>
          ) : (
            <div className="space-y-2">
              {[...coachJottings].reverse().map(j => (
                <JottingCard key={j.id} jotting={j} sessions={sessions} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
