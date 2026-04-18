import type { RestSessionRow } from "@/lib/db/types";

const REST_SESSION_HISTORY_KEY = "mongcount.rest-sessions";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readStoredRestSessions(): RestSessionRow[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = localStorage.getItem(REST_SESSION_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RestSessionRow[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((session) => typeof session?.id === "string" && typeof session?.started_at === "string");
  } catch {
    return [];
  }
}

export function writeStoredRestSessions(sessions: RestSessionRow[]): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(REST_SESSION_HISTORY_KEY, JSON.stringify(sessions));
}

export function upsertStoredRestSession(session: RestSessionRow): void {
  const byId = new Map<string, RestSessionRow>();

  for (const current of readStoredRestSessions()) {
    byId.set(current.id, current);
  }

  byId.set(session.id, session);

  writeStoredRestSessions(
    [...byId.values()].sort((left, right) => new Date(right.started_at).getTime() - new Date(left.started_at).getTime()),
  );
}
