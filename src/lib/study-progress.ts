/**
 * study-progress.ts — localStorage CRUD for test prep checklists.
 * SSR-safe: returns empty state when window is undefined.
 */

export interface StudyProgress {
  checked: Record<string, boolean>;
}

function storageKey(subjectId: string, type: string, week: number): string {
  return `prep:${subjectId}:${type}:${week}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getProgress(subjectId: string, type: string, week: number): StudyProgress {
  if (!isBrowser()) return { checked: {} };
  const key = storageKey(subjectId, type, week);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { checked: {} };
}

export function toggleTopic(
  subjectId: string,
  type: string,
  week: number,
  topicKey: string
): StudyProgress {
  const progress = getProgress(subjectId, type, week);
  progress.checked[topicKey] = !progress.checked[topicKey];
  if (!progress.checked[topicKey]) delete progress.checked[topicKey];
  if (isBrowser()) {
    const key = storageKey(subjectId, type, week);
    localStorage.setItem(key, JSON.stringify(progress));
  }
  return progress;
}

export function getCompletion(
  subjectId: string,
  type: string,
  week: number,
  total: number
): { done: number; total: number } {
  const progress = getProgress(subjectId, type, week);
  const done = Object.values(progress.checked).filter(Boolean).length;
  return { done, total };
}
