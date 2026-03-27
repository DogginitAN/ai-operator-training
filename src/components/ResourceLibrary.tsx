'use client';
import { FileText, ExternalLink, BookOpen, Eye, Download } from 'lucide-react';
import type { Resource } from '@/lib/store';

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf:       { icon: FileText,     color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/30'       },
  html:      { icon: ExternalLink, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30'     },
  reference: { icon: BookOpen,     color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
};

const ACTION_BTN = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border-brand-100 dark:border-brand-800/30 hover:bg-gradient-to-r hover:from-brand-500 hover:to-violet-500 hover:text-white hover:border-transparent';

function ResourceCard({ resource }: { resource: Resource }) {
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.reference;
  const Icon = cfg.icon;
  const hasFile = resource.filename !== null;
  const url = hasFile ? `/docs/${resource.filename}` : null;

  const openFile = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFile();
  };

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
      onClick={hasFile ? openFile : undefined}
      className={`bg-white dark:bg-night-800 rounded-xl border p-4 flex items-center gap-4 card-lift shadow-card transition-all duration-200 ${
        hasFile
          ? 'border-surface-200 dark:border-night-600 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700/50'
          : 'border-surface-200 dark:border-night-600'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={cfg.color} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-surface-900 dark:text-night-100 text-sm">{resource.title}</h4>
        <p className="text-xs text-surface-300 dark:text-night-400 mt-0.5">{resource.description}</p>
      </div>

      {/* Action buttons — shown when a file exists */}
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

      {/* Type badge — shown only for inline reference cards (no file) */}
      {!hasFile && (
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-surface-300 dark:text-night-400 bg-surface-50 dark:bg-night-700 px-2.5 py-1 rounded-lg border border-surface-200 dark:border-night-600 flex-shrink-0">
          {resource.type}
        </span>
      )}
    </div>
  );
}

const COMMANDS = [
  ['mkdir $HOME\\\\folder', 'Create a folder'],
  ['cd $HOME\\\\folder', 'Move into a folder'],
  ['claude', 'Start Claude Code'],
  ['claude --version', 'Check version'],
  ['git --version', 'Check Git'],
  ['irm https://claude.ai/install.ps1 | iex', 'Install Claude Code'],
  ['/init', 'Generate CLAUDE.md (in Claude Code)'],
  ['/compact', 'Compress conversation'],
  ['/help', 'Show commands'],
  ['Caps Lock (hold)', 'Voice input in Claude Desktop'],
  ['Shift+Tab x2', 'Plan Mode in Claude Code'],
];

export default function ResourceLibrary({ resources }: { resources: Resource[] }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-semibold text-surface-300 dark:text-night-400 uppercase tracking-wider px-1">Session Materials</h3>
        {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>

      {/* Quick Reference */}
      <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 p-6 shadow-card transition-colors duration-200">
        <h3 className="text-xs font-mono font-semibold text-violet-500 uppercase tracking-wider mb-4">Windows PowerShell Quick Reference</h3>
        <div className="space-y-0">
          {COMMANDS.map(([cmd, desc], i) => (
            <div key={i} className={`flex items-center gap-4 py-2.5 ${i < COMMANDS.length - 1 ? 'border-b border-surface-100 dark:border-night-600' : ''}`}>
              <code className="font-mono text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-800/30 px-2.5 py-1 rounded-lg min-w-[280px] whitespace-nowrap">{cmd}</code>
              <span className="text-sm text-surface-300 dark:text-night-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
