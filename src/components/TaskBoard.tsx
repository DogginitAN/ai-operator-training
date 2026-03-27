'use client';
import { Undo2, CheckCircle2 } from 'lucide-react';
import type { Task, TaskStatus } from '@/lib/store';

const COLUMNS: { key: TaskStatus; label: string; color: string; dotColor: string }[] = [
  { key: 'todo', label: 'To Do', color: 'text-surface-300 dark:text-night-400', dotColor: 'bg-surface-300 dark:bg-night-400' },
  { key: 'in_progress', label: 'In Progress', color: 'text-blue-500', dotColor: 'bg-blue-500' },
  { key: 'done', label: 'Done', color: 'text-green-500', dotColor: 'bg-green-500' },
];

const PRIORITY_COLORS = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-surface-300 dark:bg-night-400' };

const ACCENT_BAR: Record<TaskStatus, string> = {
  todo: 'bg-surface-300 dark:bg-night-400',
  in_progress: 'bg-blue-400',
  done: 'bg-green-400',
};

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, status: TaskStatus) => void }) {
  return (
    <div className="relative bg-white dark:bg-night-800 rounded-xl border border-surface-200 dark:border-night-600 overflow-hidden card-lift shadow-card transition-colors duration-200">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_BAR[task.status]}`} />

      <div className="p-4 pl-5">
        {/* Content row */}
        <div className="flex items-start gap-2.5">
          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-surface-900 dark:text-night-100 text-sm leading-snug">{task.title}</h4>
            <p className="text-xs text-surface-300 dark:text-night-400 mt-1.5 leading-relaxed">{task.description}</p>
          </div>
          {/* Undo: Done cards only */}
          {task.status === 'done' && (
            <button
              onClick={() => onMove(task.id, 'in_progress')}
              title="Move back to In Progress"
              className="flex-shrink-0 w-7 h-7 -mt-0.5 -mr-1 rounded-lg flex items-center justify-center text-surface-300 hover:text-surface-700 hover:bg-surface-100 dark:text-night-400 dark:hover:text-night-100 dark:hover:bg-night-700 transition-all duration-150"
            >
              <Undo2 size={13} />
            </button>
          )}
        </div>

        {/* Action area */}
        <div className="mt-3.5">
          {task.status === 'todo' && (
            <button
              onClick={() => onMove(task.id, 'in_progress')}
              className="w-full py-2 rounded-full text-xs font-semibold border transition-all duration-200 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/20 hover:bg-gradient-to-r hover:from-brand-500 hover:to-violet-500 hover:text-white hover:border-transparent"
            >
              Start
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => onMove(task.id, 'done')}
              className="w-full py-2 rounded-full text-xs font-semibold border transition-all duration-200 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-950/20 hover:bg-gradient-to-r hover:from-brand-500 hover:to-violet-500 hover:text-white hover:border-transparent"
            >
              Complete
            </button>
          )}
          {task.status === 'done' && (
            <div className="flex items-center justify-center gap-1.5 py-1.5">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskBoard({ tasks, onMove }: { tasks: Task[]; onMove: (id: string, status: TaskStatus) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
              <span className={`text-xs font-mono font-semibold tracking-wide uppercase ${col.color}`}>{col.label}</span>
              <span className="text-xs font-mono text-surface-300 dark:text-night-400 ml-auto">{colTasks.length}</span>
            </div>
            <div className="space-y-2.5 min-h-[120px]">
              {colTasks.map(t => <TaskCard key={t.id} task={t} onMove={onMove} />)}
              {colTasks.length === 0 && (
                <div className="border-2 border-dashed border-surface-200 dark:border-night-600 rounded-xl p-6 text-center text-xs text-surface-300 dark:text-night-400">
                  {col.key === 'done' ? 'Complete tasks to see them here' : 'No tasks'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
