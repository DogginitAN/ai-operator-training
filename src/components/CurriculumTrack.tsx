'use client';
import { useState } from 'react';
import {
  Check, Clock, Lock, Lightbulb, ChevronDown, ChevronUp,
  Monitor, Layers,
} from 'lucide-react';
import type { Session, CurriculumTheme, CurriculumReference, ThemeItem } from '@/lib/store';

// ─── types ────────────────────────────────────────────────────────────────────

type ResolvedItem =
  | { kind: 'session';   key: string; session: Session }
  | { kind: 'reference'; key: string; ref: CurriculumReference };

// ─── helpers ──────────────────────────────────────────────────────────────────

function resolveItem(
  item: ThemeItem,
  sessions: Session[],
  references: CurriculumReference[],
): ResolvedItem | null {
  if (item.type === 'session') {
    const session = sessions.find(s => s.id === item.sessionId);
    return session ? { kind: 'session', key: session.id, session } : null;
  }
  const ref = references.find(r => r.id === item.id);
  return ref ? { kind: 'reference', key: ref.id, ref } : null;
}

function getDefaultId(themes: CurriculumTheme[], sessions: Session[]): string {
  // Prefer the upcoming session
  const upcoming = sessions.find(s => s.status === 'upcoming');
  if (upcoming) return upcoming.id;
  // Fall back to the last completed session
  const completed = sessions.filter(s => s.status === 'completed');
  if (completed.length) return completed[completed.length - 1].id;
  // Fall back to first item in first theme
  const first = themes[0]?.items[0];
  if (!first) return '';
  return first.type === 'session' ? (first.sessionId ?? '') : (first.id ?? '');
}

// ─── timeline dot ─────────────────────────────────────────────────────────────

function TimelineDot({ resolved }: { resolved: ResolvedItem }) {
  if (resolved.kind === 'reference') {
    return (
      <span className="w-4 h-4 rounded-full border-2 border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/30 flex-shrink-0 z-10" />
    );
  }
  const { status } = resolved.session;
  if (status === 'completed') {
    return (
      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 z-10">
        <Check size={9} className="text-white" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="w-4 h-4 rounded-full border-2 border-brand-500 bg-brand-50 dark:bg-brand-950/30 flex-shrink-0 z-10" />
    );
  }
  // locked
  return (
    <span className="w-2.5 h-2.5 rounded-full bg-surface-200 dark:bg-night-600 flex-shrink-0 z-10 mt-0.5" />
  );
}

// ─── sidebar item ─────────────────────────────────────────────────────────────

function SidebarItem({
  resolved,
  isSelected,
  onSelect,
}: {
  resolved: ResolvedItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isLocked = resolved.kind === 'session' && resolved.session.status === 'locked';
  const label =
    resolved.kind === 'session' ? resolved.session.title : resolved.ref.title;
  const date =
    resolved.kind === 'session' && resolved.session.date
      ? new Date(resolved.session.date + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : null;

  return (
    <button
      disabled={isLocked}
      onClick={onSelect}
      className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group ${
        isSelected
          ? 'bg-brand-50 dark:bg-brand-950/20'
          : isLocked
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-surface-100 dark:hover:bg-night-700 cursor-pointer'
      }`}
    >
      {/* Selected accent bar */}
      {isSelected && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-brand-500" />
      )}

      <TimelineDot resolved={resolved} />

      <div className="flex-1 min-w-0 pt-px">
        <p
          className={`text-[13px] font-medium leading-snug truncate ${
            isSelected
              ? 'text-brand-700 dark:text-brand-400'
              : isLocked
              ? 'text-surface-300 dark:text-night-400'
              : 'text-surface-800 dark:text-night-100'
          }`}
        >
          {label}
        </p>
        {date && (
          <p className="text-[10px] font-mono text-surface-300 dark:text-night-400 mt-0.5">
            {date}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── sidebar theme section ────────────────────────────────────────────────────

function ThemeSection({
  theme,
  sessions,
  references,
  selectedId,
  onSelect,
}: {
  theme: CurriculumTheme;
  sessions: Session[];
  references: CurriculumReference[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const items = theme.items
    .map(item => resolveItem(item, sessions, references))
    .filter(Boolean) as ResolvedItem[];

  return (
    <div>
      {/* Theme header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2 text-left group"
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-surface-300 dark:text-night-400 group-hover:text-surface-600 dark:group-hover:text-night-100 transition-colors">
          {theme.title}
        </span>
        {collapsed
          ? <ChevronDown size={13} className="text-surface-300 dark:text-night-400 flex-shrink-0" />
          : <ChevronUp   size={13} className="text-surface-300 dark:text-night-400 flex-shrink-0" />
        }
      </button>

      {!collapsed && (
        <div className="relative mt-1 pb-2">
          {/* Vertical timeline line — runs behind all the dots */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-surface-200 dark:bg-night-600" />

          <div className="space-y-0.5">
            {items.map(resolved => (
              <SidebarItem
                key={resolved.key}
                resolved={resolved}
                isSelected={selectedId === resolved.key}
                onSelect={() => onSelect(resolved.key)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── session content ──────────────────────────────────────────────────────────

const SESSION_BADGE: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  upcoming:  'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  locked:    'bg-surface-100 text-surface-300 dark:bg-night-700 dark:text-night-400',
};

const SESSION_LABEL: Record<string, string> = {
  completed: 'Completed',
  upcoming:  'Up Next',
  locked:    'Locked',
};

const SESSION_ICON: Record<string, React.ElementType> = {
  completed: Check,
  upcoming:  Clock,
  locked:    Lock,
};

const SESSION_ICON_STYLE: Record<string, string> = {
  completed: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  upcoming:  'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
  locked:    'bg-surface-100 dark:bg-night-700 text-surface-300 dark:text-night-400',
};

function SessionContent({ session }: { session: Session }) {
  const StatusIcon = SESSION_ICON[session.status];
  const hasContent = session.notes || session.keyTakeaways.length > 0;

  return (
    <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 shadow-card overflow-hidden transition-colors duration-200">
      {/* Header band */}
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${SESSION_ICON_STYLE[session.status]}`}>
            <StatusIcon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-semibold text-surface-300 dark:text-night-400">
                Session {String(session.number).padStart(2, '0')}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${SESSION_BADGE[session.status]}`}>
                {SESSION_LABEL[session.status].toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-night-100 mt-1.5 leading-tight">
              {session.title}
            </h2>
            <p className="text-sm text-surface-300 dark:text-night-400 mt-1">
              {session.subtitle}
            </p>
          </div>
        </div>

        {/* Meta row */}
        {(session.date || session.duration) && (
          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-surface-100 dark:border-night-600">
            {session.date && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-surface-300 dark:text-night-400">Date</p>
                <p className="text-sm font-medium text-surface-800 dark:text-night-100 mt-0.5">
                  {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {session.duration && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-surface-300 dark:text-night-400">Duration</p>
                <p className="text-sm font-medium text-surface-800 dark:text-night-100 mt-0.5">{session.duration}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {hasContent && (
        <div className="px-7 pb-7 border-t border-surface-100 dark:border-night-600 space-y-6 pt-5">
          {session.notes && (
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-300 dark:text-night-400 mb-2">
                Session Notes
              </p>
              <p className="text-sm text-surface-800 dark:text-night-100 leading-relaxed">
                {session.notes}
              </p>
            </div>
          )}

          {session.keyTakeaways.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                <Lightbulb size={13} />
                Key Takeaways
              </div>
              <div className="space-y-3">
                {session.keyTakeaways.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    <p className="text-sm text-surface-800 dark:text-night-100 leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasContent && session.status !== 'locked' && (
        <div className="px-7 pb-7 border-t border-surface-100 dark:border-night-600 pt-5">
          <p className="text-sm text-surface-300 dark:text-night-400 italic">
            Notes and key takeaways will appear here after the session.
          </p>
        </div>
      )}

      {session.status === 'locked' && (
        <div className="px-7 pb-7 border-t border-surface-100 dark:border-night-600 pt-5">
          <p className="text-sm text-surface-300 dark:text-night-400 italic">
            This session is not yet scheduled. Complete earlier sessions to unlock it.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── reference content ────────────────────────────────────────────────────────

const REF_ICON: Record<string, React.ElementType> = {
  'hw-overview': Monitor,
  'sw-overview': Layers,
};

function ReferenceContent({ reference }: { reference: CurriculumReference }) {
  const Icon = REF_ICON[reference.id] ?? Layers;

  return (
    <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 shadow-card overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-300 dark:text-night-400">
              Reference
            </p>
            <h2 className="text-xl font-bold text-surface-900 dark:text-night-100 mt-1 leading-tight">
              {reference.title}
            </h2>
            <p className="text-sm text-surface-300 dark:text-night-400 mt-1">{reference.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="border-t border-surface-100 dark:border-night-600 divide-y divide-surface-100 dark:divide-night-600">
        {reference.sections.map((section, i) => (
          <div key={i} className="px-7 py-5">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2.5">
              {section.heading}
            </h3>
            {section.body && (
              <p className="text-sm text-surface-800 dark:text-night-100 leading-relaxed">
                {section.body}
              </p>
            )}
            {section.rows && (
              <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-night-600 mt-2">
                <table className="w-full text-sm">
                  <tbody>
                    {section.rows.map(([label, value], ri) => (
                      <tr
                        key={ri}
                        className={ri % 2 === 0
                          ? 'bg-surface-50 dark:bg-night-900/40'
                          : 'bg-white dark:bg-night-800'}
                      >
                        <td className="px-4 py-2.5 font-medium text-surface-500 dark:text-night-400 w-[40%] text-xs font-mono uppercase tracking-wide">
                          {label}
                        </td>
                        <td className="px-4 py-2.5 text-surface-900 dark:text-night-100 font-medium">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── mobile dropdown ──────────────────────────────────────────────────────────

function MobileDropdown({
  themes,
  sessions,
  references,
  selectedId,
  onSelect,
}: {
  themes: CurriculumTheme[];
  sessions: Session[];
  references: CurriculumReference[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="md:hidden mb-5">
      <select
        value={selectedId}
        onChange={e => onSelect(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-night-600 bg-white dark:bg-night-800 text-surface-900 dark:text-night-100 text-sm font-medium shadow-card focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors duration-200"
      >
        {themes.map(theme => (
          <optgroup key={theme.id} label={theme.title}>
            {theme.items.map(item => {
              const resolved = resolveItem(item, sessions, references);
              if (!resolved) return null;
              const label = resolved.kind === 'session' ? resolved.session.title : resolved.ref.title;
              const locked = resolved.kind === 'session' && resolved.session.status === 'locked';
              return (
                <option key={resolved.key} value={resolved.key} disabled={locked}>
                  {locked ? '🔒 ' : ''}{label}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CurriculumTrack({
  sessions,
  themes,
  references,
}: {
  sessions: Session[];
  themes: CurriculumTheme[];
  references: CurriculumReference[];
}) {
  const [selectedId, setSelectedId] = useState(() => getDefaultId(themes, sessions));

  // Resolve the selected item for the content panel
  const selectedResolved: ResolvedItem | null = (() => {
    for (const theme of themes) {
      for (const item of theme.items) {
        const resolved = resolveItem(item, sessions, references);
        if (resolved && resolved.key === selectedId) return resolved;
      }
    }
    return null;
  })();

  return (
    <div>
      {/* Mobile dropdown */}
      <MobileDropdown
        themes={themes}
        sessions={sessions}
        references={references}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Desktop: sidebar + content */}
      <div className="md:flex md:gap-6 md:items-start">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="hidden md:block w-[272px] flex-shrink-0 sticky top-6 bg-surface-50 dark:bg-night-800/60 border border-surface-200 dark:border-night-600 rounded-2xl overflow-hidden shadow-card">
          <div className="px-2 py-3 space-y-1">
            {themes.map(theme => (
              <ThemeSection
                key={theme.id}
                theme={theme}
                sessions={sessions}
                references={references}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </aside>

        {/* ── Content panel ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {selectedResolved ? (
            <div key={selectedId} className="content-fade-in">
              {selectedResolved.kind === 'session' ? (
                <SessionContent session={selectedResolved.session} />
              ) : (
                <ReferenceContent reference={selectedResolved.ref} />
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 p-8 text-center text-sm text-surface-300 dark:text-night-400 shadow-card">
              Select an item from the sidebar to view its details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
