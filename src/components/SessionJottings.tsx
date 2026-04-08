'use client';
import { useState } from 'react';
import { StickyNote, PenLine, ExternalLink, X } from 'lucide-react';
import type { Jotting, Session } from '@/lib/store';
import { saveStudentJottings } from '@/lib/store';

interface Props {
  sessionId: string | null;
  studentJottings: Jotting[];
  coachJottings: Jotting[];
  sessions: Session[];
  onAdd: (jotting: Jotting) => void;
  onDelete: (id: string) => void;
}

export default function SessionJottings({
  sessionId,
  studentJottings,
  coachJottings,
  sessions,
  onAdd,
  onDelete,
}: Props) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [showForm, setShowForm] = useState(false);

  const pinned = sessionId
    ? [
        ...coachJottings.filter(j => j.pinnedTo === sessionId),
        ...studentJottings.filter(j => j.pinnedTo === sessionId),
      ]
    : [];

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const jotting: Jotting = {
      id: `sj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: 'student',
      text: trimmed,
      url: url.trim() || undefined,
      pinnedTo: sessionId ?? undefined,
      createdAt: new Date().toISOString(),
    };
    onAdd(jotting);
    setText('');
    setUrl('');
    setShowForm(false);
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 sticky top-6 gap-3">
      {/* Header card */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl overflow-hidden shadow-card">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 dark:border-amber-800/40">
          <StickyNote size={14} className="text-amber-500 flex-shrink-0" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex-1">
            Session Notes
          </span>
          <button
            onClick={() => setShowForm(f => !f)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
            title="Add note"
          >
            <PenLine size={12} />
          </button>
        </div>

        {/* Quick-add form */}
        {showForm && (
          <div className="px-3 py-3 border-b border-amber-200 dark:border-amber-800/40 space-y-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Your note…"
              rows={3}
              className="w-full px-2.5 py-2 text-xs bg-white dark:bg-night-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-surface-900 dark:text-night-100 placeholder-surface-300 dark:placeholder-night-400 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Link (optional)"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-night-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-surface-900 dark:text-night-100 placeholder-surface-300 dark:placeholder-night-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!text.trim()}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowForm(false); setText(''); setUrl(''); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-surface-500 dark:text-night-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="divide-y divide-amber-100 dark:divide-amber-900/30">
          {pinned.length === 0 && !showForm && (
            <p className="px-4 py-4 text-xs text-amber-600/60 dark:text-amber-400/50 italic">
              No notes for this session yet.
            </p>
          )}
          {pinned.map(j => (
            <div key={j.id} className="px-3 py-3 group relative">
              {j.author === 'coach' && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-1 block">
                  Andrew
                </span>
              )}
              <p className="text-xs text-surface-800 dark:text-night-100 leading-relaxed pr-4">
                {j.text}
              </p>
              {j.url && (
                <a
                  href={j.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <ExternalLink size={10} />
                  <span className="truncate">{j.url}</span>
                </a>
              )}
              {j.author === 'student' && (
                <button
                  onClick={() => onDelete(j.id)}
                  className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-surface-300 hover:text-red-500 dark:text-night-500 dark:hover:text-red-400"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
