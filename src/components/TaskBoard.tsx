'use client';
import type { Task, TaskStatus } from '@/lib/store';

const COLUMNS: { key: TaskStatus; label: string; color: string; dotColor: string }[] = [
  { key: 'todo', label: 'To Do', color: 'text-surface-300 dark:text-night-400', dotColor: 'bg-surface-300 dark:bg-night-400' },
  { key: 'in_progress', label: 'In Progress', color: 'text-blue-500', dotColor: 'bg-blue-500' },
  { key: 'done', label: 'Done', color: 'text-green-500', dotColor: 'bg-green-500' },
];

const PRIORITY_COLORS = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-surface-300 dark:bg-night-400' };

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, status: TaskStatus) => void }) {
  return (
    <div className="bg-white dark:bg-night-800 rounded-xl border border-surface-200 dark:border-night-600 p-4 card-lift shadow-card transition-colors duration-200">
      <div className="flex items-start gap-2.5">
        <span className={`mt-2 w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-surface-900 dark:text-night-100 text-sm leading-snug">{task.title}</h4>
          <p className="text-xs text-surface-300 dark:text-night-400 mt-1.5 leading-relaxed">{task.description}</p>
        </div>
      </div>
      <div className="flex gap-1.5 mt-3">
        {COLUMNS.map(col => {
          const isActive = task.status === col.key;
          return (
            <button key={col.key} onClick={() => onMove(task.id, col.key)}
              className={`flex-1 py-1.5 text-[10px] font-mono font-semibold tracking-wide rounded-lg border transition-all duration-150 ${
                isActive
                  ? col.key === 'done'
                    ? 'border-green-300 bg-green-50 text-green-600 dark:border-green-700/40 dark:bg-green-950/30 dark:text-green-400'
                    : col.key === 'in_progress'
                      ? 'border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-700/40 dark:bg-blue-950/30 dark:text-blue-400'
                      : 'border-surface-300 bg-surface-100 text-surface-800 dark:border-night-600 dark:bg-night-700 dark:text-night-100'
                  : 'border-surface-200 bg-surface-50 text-surface-300 hover:border-surface-300 hover:text-surface-800 dark:border-night-600 dark:bg-night-800 dark:text-night-400 dark:hover:border-night-400 dark:hover:text-night-100'
              }`}
            >
              {col.label}
            </button>
          );
        })}
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
