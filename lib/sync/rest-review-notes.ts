import {
  readRestReviewNoteOutbox,
  upsertRestReviewNoteOutboxItem,
  writeRestReviewNoteOutbox,
} from "@/lib/db/rest-review-notes";

async function postRestReviewNoteUpdate(sessionId: string, note: string): Promise<void> {
  const response = await fetch(`/api/rest-sessions/${encodeURIComponent(sessionId)}/note`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    throw new Error("note sync failed");
  }
}

function isOnline(): boolean {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}

function queueNote(sessionId: string, note: string): void {
  upsertRestReviewNoteOutboxItem({
    sessionId,
    note,
    updatedAt: new Date().toISOString(),
  });
}

export async function syncRestReviewNoteNow(sessionId: string, note: string): Promise<void> {
  if (!isOnline()) {
    queueNote(sessionId, note);
    return;
  }

  try {
    await postRestReviewNoteUpdate(sessionId, note);
  } catch {
    queueNote(sessionId, note);
  }
}

export async function flushRestReviewNoteOutbox(): Promise<void> {
  if (!isOnline()) {
    return;
  }

  const queued = readRestReviewNoteOutbox();
  if (queued.length === 0) {
    return;
  }

  const remaining: typeof queued = [];

  for (const item of queued) {
    try {
      await postRestReviewNoteUpdate(item.sessionId, item.note);
    } catch {
      remaining.push(item);
    }
  }

  writeRestReviewNoteOutbox(remaining);
}

export function setupRestReviewNoteRecoverySync(): () => void {
  const onOnline = () => {
    void flushRestReviewNoteOutbox();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", onOnline);
    }
  };
}
