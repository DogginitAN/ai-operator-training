'use client';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, LayoutGrid, Archive, Sparkles, GraduationCap } from 'lucide-react';
import studentData from '@/data/student.json';
import { loadTaskStatuses, saveTaskStatuses } from '@/lib/store';
import type { Task, TaskStatus, Session, Resource } from '@/lib/store';
import ProgressRing from '@/components/ProgressRing';
import CurriculumTrack from '@/components/CurriculumTrack';
import TaskBoard from '@/components/TaskBoard';
import ResourceLibrary from '@/components/ResourceLibrary';
import MantrasPanel from '@/components/MantrasPanel';

const TABS = [
  { key: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { key: 'tasks', label: 'Homework', icon: LayoutGrid },
  { key: 'resources', label: 'Resources', icon: Archive },
  { key: 'principles', label: 'Principles', icon: Sparkles },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('curriculum');
  const [tasks, setTasks] = useState<Task[]>(studentData.tasks as Task[]);

  // Hydrate task statuses from localStorage
  useEffect(() => {
    const saved = loadTaskStatuses();
    if (Object.keys(saved).length > 0) {
      setTasks(prev => prev.map(t => ({ ...t, status: saved[t.id] || t.status })));
    }
  }, []);

  const handleTaskMove = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status } : t);
      saveTaskStatuses(updated);
      return updated;
    });
  }, []);

  const completedSessions = (studentData.curriculum as Session[]).filter(s => s.status === 'completed').length;
  const totalSessions = studentData.curriculum.length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">{studentData.student.avatar}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-surface-900">{studentData.student.name}</h1>
                  <span className="text-[10px] font-mono font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    {studentData.student.company}
                  </span>
                </div>
                <p className="text-sm text-surface-300 mt-0.5">
                  AI Native Operator Training · Started {new Date(studentData.student.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Progress + Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-surface-900">{doneCount}/{tasks.length}</div>
                <div className="text-[10px] font-mono text-surface-300 uppercase tracking-wider">Tasks Done</div>
              </div>
              <ProgressRing completed={completedSessions} total={totalSessions} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 ${
                    isActive
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-surface-300 hover:text-surface-800'
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
      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'curriculum' && <CurriculumTrack sessions={studentData.curriculum as Session[]} />}
        {activeTab === 'tasks' && <TaskBoard tasks={tasks} onMove={handleTaskMove} />}
        {activeTab === 'resources' && <ResourceLibrary resources={studentData.resources as Resource[]} />}
        {activeTab === 'principles' && <MantrasPanel mantras={studentData.mantras} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-6 py-4 text-center">
          <p className="text-xs font-mono text-surface-300">AI Native Operator Training · Andrew Nolan · 2026</p>
        </div>
      </footer>
    </div>
  );
}
