'use client';
import { useState } from 'react';
import { StickyNote, Sparkles, ExternalLink, Trash2, PenLine, Pin, AlertCircle } from 'lucide-react';
import type { Session } from '@/lib/store';
import type { Jotting } from '@/lib/jottings-api';
import { relativeTime, extractDomain, isJottingsConfigured } from '@/lib/jottings-api';

type J = Jotting;

interface JottingsBoardProps {
  jottings: J[];
  sessions: Session[];
  isCoach: boolean;
  onAdd: (data: { author: 'student' | 'coach'; text: string; url?: string; pinnedTo?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

// ─── jotting card ────────────────────────────────────────────────────────────

function JottingCard({
  jotting,
  sessions,
  canDelete,
  onDelete,
}: {
  jotting: J;
  sessions: Session[];
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const pinSession = jotting.pinnedTo
    ? sessions.find(s => s.id === jotting.pinnedTo)
    : null;
  const urlStr = jotting.url ?? undefined;

  return (
    <div className="bg-surface-50 dark:bg-night-900/40 rounded-xl border border-surface-200 dark:border-night-600 p-4 group relative">
      {pinSession && (
        <div className="flex items-center gap-1 mb-2">
          <Pin size={9} className="text-brand-400" />
          <span className="text-[10px] font-mono font-semibold bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full">
            Session {pinSession.number}
          </span>
        </div>
      )}

      <p className="text-sm text-surface-800 dark:text-night-100 leading-relaxed pr-6">
        {jotting.text}
      </p>

      {urlStr && (
        <a
          href={urlStr}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ExternalLink size={11} />
          {extractDomain(urlStr)}
        </a>
      )}

      <p className="text-[10px] font-mono text-surface-300 dark:text-night-400 mt-2">
        {relativeTime(jotting.createdAt)}
      </p>

      {canDelete && (
        <button
          onClick={() => onDelete(jotting.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg text-surface-300 hover:text-red-500 dark:text-night-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ─── add form ────────────────────────────────────────────────────────────────

function AddForm({
  author,
  sessions,
  onAdd,
}: {
  author: 'student' | 'coach';
  sessions: Session[];
  onAdd: (data: { author: 'student' | 'coach'; text: string; url?: string; pinnedTo?: string }) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [pinnedTo, setPinnedTo] = useState('');
  const [adding, setAdding] = useState(false);

  const unlocked = sessions.filter(s => s.status !== 'locked');

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    await onAdd({
      author,
      text: trimmed,
      url: url.trim() || undefined,
      pinnedTo: pinnedTo || undefined,
    });
    setText('');
    setUrl('');
    setPinnedTo('');
    setAdding(false);
  };

  const inputClass = 'w-full bg-surface-50 dark:bg-night-900 border border-surface-200 dark:border-night-600 rounded-xl px-4 py-2.5 text-sm text-surface-900 dark:text-night-100 placeholder:text-surface-300 dark:placeholder:text-night-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors';

  return (
    <div className="space-y-2.5">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Jot something down…"
        rows={3}
        className={`${inputClass} resize-none`}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
      />
      <div className="flex gap-2">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Link (optional)"
          className={inputClass}
        />
        <select
          value={pinnedTo}
          onChange={e => setPinnedTo(e.target.value)}
          className="bg-surface-50 dark:bg-night-900 border border-surface-200 dark:border-night-600 rounded-xl px-3 py-2.5 text-sm text-surface-900 dark:text-night-100 focus:outline-none focus:ring-2 focus:ring-brand-400 flex-shrink-0"
        >
          <option value="">No pin</option>
          {unlocked.map(s => (
            <option key={s.id} value={s.id}>S{s.number}: {s.title}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleAdd}
        disabled={!text.trim() || adding}
        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-violet-500 text-white hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
      >
        <PenLine size={14} />
        {adding ? 'Adding…' : 'Add Note'}
      </button>
    </div>
  );
}

// ─── loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
      {[0, 1].map(i => (
        <div key={i} className="space-y-3">
          <div className="h-3 w-24 bg-surface-200 dark:bg-night-700 rounded-full animate-pulse" />
          <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 shadow-card p-5 space-y-3">
            {[0, 1, 2].map(j => (
              <div key={j} className="h-16 bg-surface-100 dark:bg-night-700 rounded-xl animate-pulse" style={{ opacity: 1 - j * 0.25 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function JottingsBoard({
  jottings,
  sessions,
  isCoach,
  onAdd,
  onDelete,
  isLoading,
}: JottingsBoardProps) {
  const studentJottings = jottings.filter(j => j.author === 'student');
  const coachJottings   = jottings.filter(j => j.author === 'coach');

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-night-100">Jottings</h2>
        <p className="text-sm text-surface-300 dark:text-night-400 mt-1">
          Quick notes, links, and ideas — shared between Matt and Andrew.
        </p>
      </div>

      {/* Not configured banner */}
      {!isJottingsConfigured && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle size={16} className="flex-shrink-0" />
          Jottings API not configured — set <code className="font-mono text-xs">NEXT_PUBLIC_JOTTINGS_API</code> to enable syncing.
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">

          {/* ── Matt's lane ─────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 dark:border-night-600 flex items-center gap-2">
              <StickyNote size={13} className="text-brand-500 flex-shrink-0" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-500 flex-1">
                Matt's Jottings
              </span>
              <span className="text-[10px] font-mono text-surface-300 dark:text-night-400">
                {studentJottings.length}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {!isCoach && (
                <AddForm author="student" sessions={sessions} onAdd={onAdd} />
              )}

              {studentJottings.length === 0 ? (
                <p className="text-sm text-surface-300 dark:text-night-400 italic">
                  {isCoach ? 'No notes from Matt yet.' : 'Nothing jotted yet — add your first note above.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {studentJottings.map(j => (
                    <JottingCard
                      key={j.id}
                      jotting={j}
                      sessions={sessions}
                      canDelete={!isCoach}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Andrew's lane ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 dark:border-night-600 flex items-center gap-2">
              <Sparkles size={13} className="text-violet-500 flex-shrink-0" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-500 flex-1">
                Andrew's Jottings
              </span>
              <span className="text-[10px] font-mono text-surface-300 dark:text-night-400">
                {coachJottings.length}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {isCoach && (
                <AddForm author="coach" sessions={sessions} onAdd={onAdd} />
              )}

              {coachJottings.length === 0 ? (
                <p className="text-sm text-surface-300 dark:text-night-400 italic">
                  {isCoach ? 'Nothing jotted yet — add your first note above.' : 'No notes from Andrew yet.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {coachJottings.map(j => (
                    <JottingCard
                      key={j.id}
                      jotting={j}
                      sessions={sessions}
                      canDelete={isCoach}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
