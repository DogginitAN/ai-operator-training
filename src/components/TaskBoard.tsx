'use client';
import { useState, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Task, TaskStatus } from '@/lib/store';

const COLUMNS: { key: TaskStatus; label: string; color: string; dotColor: string }[] = [
  { key: 'todo',        label: 'To Do',       color: 'text-surface-300 dark:text-night-400', dotColor: 'bg-surface-300 dark:bg-night-400' },
  { key: 'in_progress', label: 'In Progress', color: 'text-blue-500',                        dotColor: 'bg-blue-500'                       },
  { key: 'done',        label: 'Done',        color: 'text-green-500',                       dotColor: 'bg-green-500'                      },
];

const PRIORITY_COLORS: Record<string, string> = {
  high:   'bg-red-400',
  medium: 'bg-amber-400',
  low:    'bg-surface-300 dark:bg-night-400',
};

const ACCENT_BAR: Record<TaskStatus, string> = {
  todo:        'bg-surface-300 dark:bg-night-400',
  in_progress: 'bg-blue-400',
  done:        'bg-green-400',
};

const DROP_ZONE_ACTIVE: Record<TaskStatus, string> = {
  todo:        'border-dashed border-surface-300 dark:border-night-400 bg-surface-100/70 dark:bg-night-700/40',
  in_progress: 'border-dashed border-blue-300 dark:border-blue-700/50 bg-blue-50/70 dark:bg-blue-950/20',
  done:        'border-dashed border-green-300 dark:border-green-700/50 bg-green-50/70 dark:bg-green-950/20',
};

const BACK_BTN = 'text-[11px] text-surface-300 dark:text-night-400 hover:text-surface-700 dark:hover:text-night-100 transition-colors duration-150';

function TaskCard({
  task,
  onMove,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  onMove: (id: string, status: TaskStatus) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        // Required for Firefox
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`relative bg-white dark:bg-night-800 rounded-xl border border-surface-200 dark:border-night-600 overflow-hidden shadow-card select-none transition-all duration-150 ${
        isDragging
          ? 'opacity-50 rotate-2 cursor-grabbing scale-[1.02]'
          : 'card-lift cursor-grab'
      }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_BAR[task.status]}`} />

      <div className="p-4 pl-5">
        {/* Title + description */}
        <div className="flex items-start gap-2.5">
          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-surface-900 dark:text-night-100 text-sm leading-snug">{task.title}</h4>
            <p className="text-xs text-surface-300 dark:text-night-400 mt-1.5 leading-relaxed">{task.description}</p>
          </div>
        </div>

        {/* Action area */}
        <div className="mt-3.5 space-y-1.5">

          {task.status === 'todo' && (
            <button
              onClick={() => onMove(task.id, 'in_progress')}
              className="w-full py-2 rounded-full text-xs font-semibold border transition-all duration-200 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/20 hover:bg-gradient-to-r hover:from-brand-500 hover:to-violet-500 hover:text-white hover:border-transparent"
            >
              Start
            </button>
          )}

          {task.status === 'in_progress' && (
            <>
              <button
                onClick={() => onMove(task.id, 'done')}
                className="w-full py-2 rounded-full text-xs font-semibold border transition-all duration-200 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-950/20 hover:bg-gradient-to-r hover:from-brand-500 hover:to-violet-500 hover:text-white hover:border-transparent"
              >
                Complete
              </button>
              <div className="flex justify-center pt-0.5">
                <button onClick={() => onMove(task.id, 'todo')} className={BACK_BTN}>
                  ← Back to To Do
                </button>
              </div>
            </>
          )}

          {task.status === 'done' && (
            <>
              <div className="flex items-center justify-center gap-1.5 py-1.5">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Completed</span>
              </div>
              <div className="flex justify-center">
                <button onClick={() => onMove(task.id, 'in_progress')} className={BACK_BTN}>
                  ↩ Undo
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function TaskBoard({ tasks, onMove }: { tasks: Task[]; onMove: (id: string, status: TaskStatus) => void }) {
  const dragId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, colKey: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear when leaving the column entirely, not when entering a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colKey: TaskStatus) => {
    e.preventDefault();
    const id = dragId.current ?? e.dataTransfer.getData('text/plain');
    if (id) onMove(id, colKey);
    dragId.current = null;
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        const isOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
              <span className={`text-xs font-mono font-semibold tracking-wide uppercase ${col.color}`}>{col.label}</span>
              <span className="text-xs font-mono text-surface-300 dark:text-night-400 ml-auto">{colTasks.length}</span>
            </div>

            {/* Drop zone wrapper — shows visual feedback when a card is dragged over */}
            <div className={`rounded-xl border-2 p-1.5 -m-1.5 min-h-[140px] transition-all duration-150 ${
              isOver ? DROP_ZONE_ACTIVE[col.key] : 'border-transparent'
            }`}>
              <div className="space-y-2.5">
                {colTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onMove={onMove}
                    isDragging={draggingId === t.id}
                    onDragStart={() => {
                      dragId.current = t.id;
                      setDraggingId(t.id);
                    }}
                    onDragEnd={() => {
                      dragId.current = null;
                      setDraggingId(null);
                      setDragOverCol(null);
                    }}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className={`rounded-xl p-6 text-center text-xs transition-all duration-150 ${
                    isOver
                      ? 'text-surface-400 dark:text-night-400'
                      : 'border-2 border-dashed border-surface-200 dark:border-night-600 text-surface-300 dark:text-night-400'
                  }`}>
                    {col.key === 'done' ? 'Complete tasks to see them here' : 'No tasks'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
