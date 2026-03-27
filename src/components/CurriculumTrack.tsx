'use client';
import { useState } from 'react';
import { Check, Clock, Lock, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import type { Session } from '@/lib/store';

const STATUS_STYLES = {
  completed: { icon: Check, bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  upcoming: { icon: Clock, bg: 'bg-brand-50', border: 'border-brand-300', iconBg: 'bg-brand-100', iconColor: 'text-brand-600', badge: 'bg-brand-100 text-brand-700' },
  locked: { icon: Lock, bg: 'bg-surface-50', border: 'border-surface-200', iconBg: 'bg-surface-100', iconColor: 'text-surface-300', badge: 'bg-surface-100 text-surface-300' },
};

function SessionCard({ session }: { session: Session }) {
  const [expanded, setExpanded] = useState(session.status === 'completed' || session.status === 'upcoming');
  const style = STATUS_STYLES[session.status];
  const Icon = style.icon;
  const isClickable = session.status !== 'locked';

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} transition-all duration-200 ${isClickable ? 'card-lift cursor-pointer' : 'opacity-50'}`}>
      <div className="flex items-center gap-4 p-5" onClick={() => isClickable && setExpanded(!expanded)}>
        {/* Number + Icon */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-surface-300 w-5">{String(session.number).padStart(2, '0')}</span>
          <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
            <Icon size={18} className={style.iconColor} />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-surface-900 text-[15px]">{session.title}</h3>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
              {session.status === 'completed' ? 'DONE' : session.status === 'upcoming' ? 'NEXT' : 'LOCKED'}
            </span>
          </div>
          <p className="text-sm text-surface-300 mt-0.5">{session.subtitle}</p>
        </div>

        {/* Date + Chevron */}
        <div className="flex items-center gap-3">
          {session.date && (
            <span className="text-xs font-mono text-surface-300">
              {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {session.duration && <span className="text-xs font-mono text-surface-300">{session.duration}</span>}
          {isClickable && (expanded ? <ChevronDown size={16} className="text-surface-300" /> : <ChevronRight size={16} className="text-surface-300" />)}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && isClickable && (session.notes || session.keyTakeaways.length > 0) && (
        <div className="px-5 pb-5 pt-0 border-t border-surface-200/50">
          {session.notes && (
            <p className="text-sm text-surface-800 leading-relaxed mt-4">{session.notes}</p>
          )}
          {session.keyTakeaways.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 uppercase tracking-wide">
                <Lightbulb size={13} />
                Key Takeaways
              </div>
              {session.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-surface-800">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CurriculumTrack({ sessions }: { sessions: Session[] }) {
  return (
    <div className="space-y-3">
      {sessions.map(s => <SessionCard key={s.id} session={s} />)}
    </div>
  );
}
