'use client';
import { useState } from 'react';
import { FileText, ExternalLink, BookOpen, Eye, Download, Search } from 'lucide-react';
import type { Resource, Session } from '@/lib/store';
import studentData from '@/data/student.json';

// ─── constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf:       { icon: FileText,     color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/30'       },
  html:      { icon: ExternalLink, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30'     },
  reference: { icon: BookOpen,     color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  link:      { icon: ExternalLink, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
};

const ACTION_BTN = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border-brand-100 dark:border-brand-800/30 hover:bg-gradient-to-r hover:from-brand-500 hover:to-violet-500 hover:text-white hover:border-transparent';

function formatTag(tag: string): string {
  return tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── resource card ─────────────────────────────────────────────────────────────

function ResourceCard({
  resource,
  onTagClick,
}: {
  resource: Resource;
  onTagClick: (tag: string) => void;
}) {
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.reference;
  const Icon = cfg.icon;
  const hasFile = resource.filename !== null;
  const hasUrl = (resource as any).url != null;
  const url = hasFile ? `/docs/${resource.filename}` : hasUrl ? (resource as any).url : null;

  const openFile = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  const handleOpen = (e: React.MouseEvent) => { e.stopPropagation(); openFile(); };
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resource.filename) return;
    const link = document.createElement('a');
    link.href = `/docs/${resource.filename}`;
    link.download = resource.filename;
    link.click();
  };

  return (
    <div
      onClick={(hasFile || hasUrl) ? openFile : undefined}
      className={`bg-white dark:bg-night-800 rounded-xl border p-4 card-lift shadow-card transition-all duration-200 ${
        hasFile || hasUrl
          ? 'border-surface-200 dark:border-night-600 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700/50'
          : 'border-surface-200 dark:border-night-600'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={cfg.color} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-surface-900 dark:text-night-100 text-sm">{resource.title}</h4>
          <p className="text-xs text-surface-300 dark:text-night-400 mt-0.5">{resource.description}</p>
        </div>

        {hasFile && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {resource.type === 'pdf' && (
              <>
                <button onClick={handleOpen} className={ACTION_BTN}>
                  <Eye size={12} />
                  Preview
                </button>
                <button onClick={handleDownload} className={ACTION_BTN}>
                  <Download size={12} />
                  Download
                </button>
              </>
            )}
            {resource.type === 'html' && (
              <button onClick={handleOpen} className={ACTION_BTN}>
                <ExternalLink size={12} />
                Open
              </button>
            )}
          </div>
        )}

        {!hasFile && (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-surface-300 dark:text-night-400 bg-surface-50 dark:bg-night-700 px-2.5 py-1 rounded-lg border border-surface-200 dark:border-night-600 flex-shrink-0">
            {resource.type}
          </span>
        )}
      </div>

      {/* Tags row */}
      {(resource.tags.length > 0 || resource.global) && (
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {resource.tags.map(tag => (
            <button
              key={tag}
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              className="text-[10px] font-mono bg-surface-50 dark:bg-night-700 text-surface-300 dark:text-night-400 px-2 py-0.5 rounded-full border border-surface-200 dark:border-night-600 hover:border-brand-300 dark:hover:border-brand-700/50 transition-colors duration-150"
            >
              {tag}
            </button>
          ))}
          {resource.global && (
            <span className="text-[10px] font-mono bg-violet-50 dark:bg-violet-950/30 text-violet-500 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/30">
              global
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ResourceLibrary({ resources }: { resources: Resource[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // Derive unique tags from all resources (preserve insertion order)
  const allTags = Array.from(new Set(resources.flatMap(r => r.tags)));

  // Session options: curriculum sessions that appear in at least one resource
  const sessions = studentData.curriculum as Session[];
  const sessionIdsInResources = new Set(resources.flatMap(r => r.sessions));
  const sessionOptions = sessions.filter(s => sessionIdsInResources.has(s.id));

  // Combined filter
  const filtered = resources.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q);
    const matchesTag = !activeTag || r.tags.includes(activeTag);
    const matchesSession = !activeSession || r.sessions.includes(activeSession) || r.global;
    return matchesSearch && matchesTag && matchesSession;
  });

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTag(null);
    setActiveSession(null);
  };

  const hasActiveFilters = searchQuery !== '' || activeTag !== null || activeSession !== null;

  return (
    <div className="space-y-4">

      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300 dark:text-night-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search resources..."
          className="w-full bg-white dark:bg-night-800 rounded-xl border border-surface-200 dark:border-night-600 pl-10 pr-4 py-2.5 text-sm text-surface-900 dark:text-night-100 placeholder:text-surface-300 dark:placeholder:text-night-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-colors duration-200"
        />
      </div>

      {/* Filter row: tag pills + session dropdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              activeTag === null
                ? 'bg-gradient-to-r from-brand-500 to-violet-500 text-white border-transparent'
                : 'bg-white dark:bg-night-800 text-surface-800 dark:text-night-100 border-surface-200 dark:border-night-600 hover:border-brand-300'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                activeTag === tag
                  ? 'bg-gradient-to-r from-brand-500 to-violet-500 text-white border-transparent'
                  : 'bg-white dark:bg-night-800 text-surface-800 dark:text-night-100 border-surface-200 dark:border-night-600 hover:border-brand-300'
              }`}
            >
              {formatTag(tag)}
            </button>
          ))}
        </div>

        {sessionOptions.length > 0 && (
          <select
            value={activeSession ?? ''}
            onChange={e => setActiveSession(e.target.value || null)}
            className="px-3 py-1.5 rounded-xl border border-surface-200 dark:border-night-600 bg-white dark:bg-night-800 text-surface-900 dark:text-night-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors duration-200 flex-shrink-0"
          >
            <option value="">All Sessions</option>
            {sessionOptions.map(s => (
              <option key={s.id} value={s.id}>Session {s.number}</option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs font-mono text-surface-300 dark:text-night-400 px-0.5">
        {filtered.length === 0
          ? 'No resources found'
          : `${filtered.length} resource${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Cards or empty state */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(r => (
            <ResourceCard key={r.id} resource={r} onTagClick={handleTagClick} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 p-10 text-center shadow-card">
          <p className="text-sm text-surface-300 dark:text-night-400 mb-3">
            No resources match your filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

    </div>
  );
}
