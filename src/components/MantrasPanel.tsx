'use client';
import { Sparkles } from 'lucide-react';

export default function MantrasPanel({ mantras }: { mantras: string[] }) {
  return (
    <div className="bg-white dark:bg-night-800 rounded-2xl border border-surface-200 dark:border-night-600 p-6 shadow-card transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <h3 className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Core Principles</h3>
      </div>
      <div className="space-y-0">
        {mantras.map((m, i) => (
          <div key={i} className={`flex items-start gap-3 py-3 ${i < mantras.length - 1 ? 'border-b border-surface-100 dark:border-night-600' : ''}`}>
            <span className="font-mono text-[10px] font-semibold bg-gradient-to-br from-brand-500 to-violet-500 text-white px-2 py-0.5 rounded mt-0.5 flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-sm text-surface-800 dark:text-night-100 leading-relaxed">{m}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
