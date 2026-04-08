'use client';
import { useState } from 'react';
import { StickyNote, ExternalLink, X } from 'lucide-react';
import type { Session } from '@/lib/store';
import type { Jotting } from '@/lib/jottings-api';
import { relativeTime, extractDomain } from '@/lib/jottings-api';

interface Props {
  sessionId: string | null;
  jottings: Jotting[];
  sessions: Session[];
  isCoach: boolean;
  onAdd: (data: { author: 'student' | 'coach'; text: string; url?: string; pinnedTo?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ─── compact jotting row ──────────────────────────────────────────────────────

function JottingRow({
  jotting,
  isCoach,
  onDelete,
}: {
  jotting: Jotting;
  isCoach: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const canDelete =
    (isCoach && jotting.author === 'coach') || (!isCoach && jotting.author === 'student');
  const urlStr = jotting.url ?? undefined;
  const isLong = jotting.text.length > 120;

  return (
    <div className="mx-3 mb-2 p-3 rounded-lg bg-white dark:bg-night-800 border border-surface-100 dark:border-night-600 group relative">
      {/* Author + timestamp */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            jotting.author === 'student' ? 'bg-brand-500' : 'bg-violet-500'
          }`}
        />
        <span className="text-[10px] font-mono font-semibold text-surface-400 dark:text-night-400">
          {jotting.author === 'student' ? 'Matt' : 'Andrew'}
        </span>
        <span className="text-[10px] font-mono text-surface-300 dark:text-night-500 ml-auto">
          {relativeTime(jotting.createdAt)}
        </span>
      </div>

      {/* Text */}
      <p
        className={`text-xs text-surface-800 dark:text-night-100 leading-relaxed ${
          !expanded ? 'line-clamp-3' : ''
        } ${canDelete ? 'pr-5' : ''}`}
      >
        {jotting.text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[10px] text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 mt-0.5"
        >
          {expanded ? 'less' : 'more'}
        </button>
      )}

      {/* URL */}
      {urlStr && (
        <a
          href={urlStr}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ExternalLink size={9} />
          <span className="truncate">{extractDomain(urlStr)}</span>
        </a>
      )}

      {/* Delete */}
      {canDelete && (
        <button
          onClick={() => onDelete(jotting.id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-surface-300 hover:text-red-500 dark:text-night-500 dark:hover:text-red-400"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function SessionJottings({
  sessionId,
  jottings,
  sessions,
  isCoach,
  onAdd,
  onDelete,
}: Props) {
  const [quickText, setQuickText] = useState('');
  const [adding, setAdding] = useState(false);

  const pinned = sessionId
    ? jottings.filter(j => j.pinnedTo === sessionId)
    : [];

  const handleQuickAdd = async () => {
    const trimmed = quickText.trim();
    if (!trimmed || adding || !sessionId) return;
    setAdding(true);
    await onAdd({
      author: isCoach ? 'coach' : 'student',
      text: trimmed,
      pinnedTo: sessionId,
    });
    setQuickText('');
    setAdding(false);
  };

  // Only show the column when a session is selected (not a reference)
  if (!sessionId) return null;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 sticky top-6">
      <div className="bg-surface-50 dark:bg-night-800/60 border border-surface-200 dark:border-night-600 rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-200 dark:border-night-600">
          <StickyNote size={13} className="text-amber-500 flex-shrink-0" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Jottings
          </span>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {pinned.length === 0 ? (
            <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
              <StickyNote size={20} className="text-surface-200 dark:text-night-600" />
              <p className="text-xs text-surface-300 dark:text-night-400 italic">
                No jottings for this session yet.
              </p>
            </div>
          ) : (
            <div className="pt-2 pb-1">
              {pinned.map(j => (
                <JottingRow
                  key={j.id}
                  jotting={j}
                  isCoach={isCoach}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick-add at bottom */}
        <div className="border-t border-surface-200 dark:border-night-600 mx-3 mb-3 mt-1">
          <div className="flex gap-2 pt-2">
            <input
              value={quickText}
              onChange={e => setQuickText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
              placeholder="Quick note…"
              className="flex-1 min-w-0 px-3 py-2 text-xs bg-white dark:bg-night-800 border border-surface-200 dark:border-night-600 rounded-lg text-surface-900 dark:text-night-100 placeholder:text-surface-300 dark:placeholder:text-night-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <button
              onClick={handleQuickAdd}
              disabled={!quickText.trim() || adding}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
