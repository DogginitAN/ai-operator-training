const API_BASE = process.env.NEXT_PUBLIC_JOTTINGS_API ?? '';

export const isJottingsConfigured = Boolean(API_BASE);

export interface Jotting {
  id: string;
  author: 'student' | 'coach';
  text: string;
  url?: string | null;
  pinnedTo?: string | null;
  createdAt: string;
}

export async function fetchJottings(sessionId?: string): Promise<Jotting[]> {
  if (!API_BASE) return [];
  try {
    const params = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await fetch(`${API_BASE}${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch jottings:', err);
    return [];
  }
}

export async function createJotting(
  data: { author: 'student' | 'coach'; text: string; url?: string; pinnedTo?: string }
): Promise<Jotting | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to create jotting:', err);
    return null;
  }
}

export async function deleteJotting(id: string): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete jotting:', err);
    return false;
  }
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
