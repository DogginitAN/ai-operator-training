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
  url?: string | null;
  tags: string[];
  sessions: string[];
  global: boolean;
  category: 'lesson-plan' | 'homework' | 'guide' | 'reference';
}

export interface ReferenceSection {
  heading: string;
  body?: string;
  rows?: string[][];
}

export interface CurriculumReference {
  id: string;
  title: string;
  subtitle: string;
  filename: string | null;
  url?: string | null;
  sections: ReferenceSection[];
}

export interface ThemeItem {
  type: 'session' | 'reference';
  sessionId?: string;
  id?: string;
  title?: string;
}

export interface CurriculumTheme {
  id: string;
  title: string;
  items: ThemeItem[];
}

export interface StoreData {
  student: Student;
  curriculum: Session[];
  themes: CurriculumTheme[];
  references: CurriculumReference[];
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
