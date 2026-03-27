'use client';
import { FileText, ExternalLink, BookOpen, Download } from 'lucide-react';
import type { Resource } from '@/lib/store';

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  html: { icon: ExternalLink, color: 'text-blue-500', bg: 'bg-blue-50' },
  reference: { icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
};

function ResourceCard({ resource }: { resource: Resource }) {
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.reference;
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-4 card-lift shadow-card group">
      <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-surface-900 text-sm">{resource.title}</h4>
        <p className="text-xs text-surface-300 mt-0.5">{resource.description}</p>
      </div>
      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-surface-300 bg-surface-50 px-2.5 py-1 rounded-lg border border-surface-200">
        {resource.type}
      </span>
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
        <h3 className="text-xs font-mono font-semibold text-surface-300 uppercase tracking-wider px-1">Session Materials</h3>
        {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>

      {/* Quick Reference */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card">
        <h3 className="text-xs font-mono font-semibold text-violet-500 uppercase tracking-wider mb-4">Windows PowerShell Quick Reference</h3>
        <div className="space-y-0">
          {COMMANDS.map(([cmd, desc], i) => (
            <div key={i} className={`flex items-center gap-4 py-2.5 ${i < COMMANDS.length - 1 ? 'border-b border-surface-100' : ''}`}>
              <code className="font-mono text-xs text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-lg min-w-[280px] whitespace-nowrap">{cmd}</code>
              <span className="text-sm text-surface-300">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
