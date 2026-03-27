import studentData from '@/data/student.json';

const STORAGE_KEY = 'ai-operator-training';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type SessionStatus = 'completed' | 'upcoming' | 'locked';
export type Priority = 'high' | 'medium' | 'low';

export interface Student {
  name: string;
  company: string;
  startDate: string;
  avatar: string;
}

export interface Session {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  date: string | null;
  status: SessionStatus;
  duration: string | null;
  notes: string;
  keyTakeaways: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  session: string;
  status: TaskStatus;
  priority: Priority;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  filename: string | null;
  session: string;
}

export interface StoreData {
  student: Student;
  curriculum: Session[];
  tasks: Task[];
  resources: Resource[];
  mantras: string[];
}

export function loadStore(): StoreData {
  if (typeof window === 'undefined') return studentData as StoreData;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...studentData, ...parsed } as StoreData;
    }
  } catch {}
  return studentData as StoreData;
}

export function saveTaskStatuses(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  const statuses: Record<string, TaskStatus> = {};
  tasks.forEach(t => { statuses[t.id] = t.status; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ taskStatuses: statuses }));
}

export function loadTaskStatuses(): Record<string, TaskStatus> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.taskStatuses || {};
    }
  } catch {}
  return {};
}
