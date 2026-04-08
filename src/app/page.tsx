'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, LayoutGrid, Archive, Sparkles, Sun, Moon, StickyNote } from 'lucide-react';
import studentData from '@/data/student.json';
import { loadTaskStatuses, saveTaskStatuses } from '@/lib/store';
import type { Task, TaskStatus, Session, Resource, CurriculumTheme, CurriculumReference } from '@/lib/store';
import { fetchJottings, createJotting, deleteJotting } from '@/lib/jottings-api';
import type { Jotting } from '@/lib/jottings-api';
import ProgressRing from '@/components/ProgressRing';
import CurriculumTrack from '@/components/CurriculumTrack';
import TaskBoard from '@/components/TaskBoard';
import ResourceLibrary from '@/components/ResourceLibrary';
import MantrasPanel from '@/components/MantrasPanel';
import JottingsBoard from '@/components/JottingsBoard';

const TABS = [
  { key: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { key: 'tasks',      label: 'Homework',   icon: LayoutGrid },
  { key: 'jottings',  label: 'Jottings',   icon: StickyNote },
  { key: 'resources', label: 'Resources',  icon: Archive },
  { key: 'principles',label: 'Principles', icon: Sparkles },
] as const;

type TabKey = typeof TABS[number]['key'];

// ─── main dashboard (needs Suspense for useSearchParams) ──────────────────────

function Dashboard() {
  const searchParams = useSearchParams();
  const isCoach = searchParams.get('role') === 'coach';

  const [activeTab, setActiveTab] = useState<TabKey>('curriculum');
  const [tasks, setTasks] = useState<Task[]>(studentData.tasks as Task[]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [jottings, setJottings] = useState<Jotting[]>([]);
  const [jottingsLoading, setJottingsLoading] = useState(true);

  const didHydrate = useRef(false);

  // Hydrate task statuses from localStorage once on mount
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const saved = loadTaskStatuses();
    if (Object.keys(saved).length > 0) {
      setTasks(prev => prev.map(t => ({ ...t, status: saved[t.id] ?? t.status })));
    }
  }, []);

  // Fetch jottings from API on mount
  useEffect(() => {
    fetchJottings().then(data => {
      setJottings(data);
      setJottingsLoading(false);
    });
  }, []);

  // Hydrate theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ai-operator-theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('ai-operator-theme', next);
  };

  const handleTaskMove = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status } : t);
      saveTaskStatuses(next);
      return next;
    });
  }, []);

  // Optimistic add: insert temp jotting immediately, replace/revert after API resolves
  const handleAddJotting = useCallback(async (
    data: { author: 'student' | 'coach'; text: string; url?: string; pinnedTo?: string }
  ) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Jotting = {
      id: tempId,
      author: data.author,
      text: data.text,
      url: data.url ?? null,
      pinnedTo: data.pinnedTo ?? null,
      createdAt: new Date().toISOString(),
    };
    setJottings(prev => [optimistic, ...prev]);

    const result = await createJotting(data);
    if (result) {
      setJottings(prev => prev.map(j => j.id === tempId ? result : j));
    } else {
      setJottings(prev => prev.filter(j => j.id !== tempId));
    }
  }, []);

  // Optimistic delete: remove immediately, revert if API fails
  const handleDeleteJotting = useCallback(async (id: string) => {
    const prev = jottings;
    setJottings(jottings.filter(j => j.id !== id));
    const success = await deleteJotting(id);
    if (!success) setJottings(prev);
  }, [jottings]);

  const completedSessions = (studentData.curriculum as Session[]).filter(s => s.status === 'completed').length;
  const totalSessions = studentData.curriculum.length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-night-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-night-800 border-b border-surface-200 dark:border-night-600 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">{studentData.student.avatar}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-surface-900 dark:text-night-100">{studentData.student.name}</h1>
                  <span className="text-[10px] font-mono font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full">
                    {studentData.student.company}
                  </span>
                  {isCoach && (
                    <span className="text-[10px] font-mono font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 px-2 py-0.5 rounded-full">
                      Coach View
                    </span>
                  )}
                </div>
                <p className="text-sm text-surface-300 dark:text-night-400 mt-0.5">
                  AI Native Operator Training · Started {new Date(studentData.student.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Progress + Stats + Toggle */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-surface-900 dark:text-night-100">{doneCount}/{tasks.length}</div>
                <div className="text-[10px] font-mono text-surface-300 dark:text-night-400 uppercase tracking-wider">Tasks Done</div>
              </div>
              <ProgressRing completed={completedSessions} total={totalSessions} />
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 text-surface-300 hover:text-surface-800 hover:bg-surface-100 dark:text-night-400 dark:hover:text-night-100 dark:hover:bg-night-700"
              >
                <div className="relative w-[18px] h-[18px]">
                  <Sun
                    size={18}
                    className={`absolute inset-0 transition-all duration-200 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90 scale-50'}`}
                  />
                  <Moon
                    size={18}
                    className={`absolute inset-0 transition-all duration-200 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 scale-50'}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 ${
                    isActive
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-surface-300 hover:text-surface-800 dark:text-night-400 dark:hover:text-night-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.key === 'tasks' && todoCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-gradient-to-r from-brand-500 to-violet-500 text-white px-2 py-0.5 rounded-full">
                      {todoCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'curriculum' && (
          <CurriculumTrack
            sessions={studentData.curriculum as Session[]}
            themes={studentData.themes as CurriculumTheme[]}
            references={studentData.references as CurriculumReference[]}
            jottings={jottings}
            isCoach={isCoach}
            onAddJotting={handleAddJotting}
            onDeleteJotting={handleDeleteJotting}
          />
        )}
        {activeTab === 'tasks' && (
          <TaskBoard tasks={tasks} sessions={studentData.curriculum as Session[]} onMove={handleTaskMove} />
        )}
        {activeTab === 'jottings' && (
          <JottingsBoard
            jottings={jottings}
            sessions={studentData.curriculum as Session[]}
            isCoach={isCoach}
            onAdd={handleAddJotting}
            onDelete={handleDeleteJotting}
            isLoading={jottingsLoading}
          />
        )}
        {activeTab === 'resources' && (
          <ResourceLibrary resources={studentData.resources as Resource[]} />
        )}
        {activeTab === 'principles' && (
          <MantrasPanel mantras={studentData.mantras} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-night-600 bg-white dark:bg-night-800 mt-12 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center">
          <p className="text-xs font-mono text-surface-300 dark:text-night-400">AI Native Operator Training · Andrew Nolan · 2026</p>
        </div>
      </footer>
    </div>
  );
}

// ─── page export (Suspense required for useSearchParams in App Router) ────────

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50 dark:bg-night-900" />}>
      <Dashboard />
    </Suspense>
  );
}
