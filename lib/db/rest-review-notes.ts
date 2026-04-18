const NOTE_DRAFT_PREFIX = "mongcount.rest-review.note.";
const NOTE_OUTBOX_KEY = "mongcount.rest-review.note.outbox";

export interface RestReviewNoteOutboxItem {
  sessionId: string;
  note: string;
  updatedAt: string;
}

function noteDraftKey(sessionId: string): string {
  return `${NOTE_DRAFT_PREFIX}${sessionId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadRestReviewNoteDraft(sessionId: string): string {
  if (!isBrowser()) {
    return "";
  }

  return localStorage.getItem(noteDraftKey(sessionId)) ?? "";
}

export function saveRestReviewNoteDraft(sessionId: string, note: string): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(noteDraftKey(sessionId), note);
}

export function readRestReviewNoteOutbox(): RestReviewNoteOutboxItem[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = localStorage.getItem(NOTE_OUTBOX_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RestReviewNoteOutboxItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => Boolean(item?.sessionId));
  } catch {
    return [];
  }
}

export function writeRestReviewNoteOutbox(items: RestReviewNoteOutboxItem[]): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(NOTE_OUTBOX_KEY, JSON.stringify(items));
}

export function upsertRestReviewNoteOutboxItem(item: RestReviewNoteOutboxItem): void {
  const map = new Map<string, RestReviewNoteOutboxItem>();

  for (const queued of readRestReviewNoteOutbox()) {
    map.set(queued.sessionId, queued);
  }

  map.set(item.sessionId, item);
  writeRestReviewNoteOutbox([...map.values()]);
}
