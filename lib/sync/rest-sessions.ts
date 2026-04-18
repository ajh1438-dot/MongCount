import type { RestSessionRepository } from "@/lib/db/repositories";
import type { RestSessionRow } from "@/lib/db/types";

const DEFAULT_FREE_RETENTION_DAYS = 7;
const DEFAULT_FETCH_LIMIT = 500;

export interface RestSessionSyncDependencies {
  userId: string;
  localRestSessions: RestSessionRepository;
  remoteRestSessions: RestSessionRepository;
  now?: () => Date;
  freeRetentionDays?: number;
  fetchLimit?: number;
}

export interface RestSessionSyncResult {
  pushedToRemote: number;
  pulledFromRemote: number;
  mergedRows: number;
  skippedOutsideRetention: number;
}

function parseTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getSessionRecency(session: RestSessionRow): number {
  return Math.max(
    parseTimestamp(session.ended_at),
    parseTimestamp(session.started_at),
    parseTimestamp(session.created_at),
  );
}

function pickByRecency<T>(
  local: RestSessionRow,
  remote: RestSessionRow,
  selector: (row: RestSessionRow) => T,
): T {
  return getSessionRecency(remote) >= getSessionRecency(local) ? selector(remote) : selector(local);
}

function pickLatestIso(...values: Array<string | null>): string | null {
  const present = values.filter((value): value is string => Boolean(value));

  if (present.length === 0) {
    return null;
  }

  return present.sort((a, b) => parseTimestamp(b) - parseTimestamp(a))[0] ?? null;
}

function mergeRestSessionRows(local: RestSessionRow, remote: RestSessionRow): RestSessionRow {
  return {
    id: local.id,
    user_id: pickByRecency(local, remote, (row) => row.user_id) ?? local.user_id ?? remote.user_id,
    slot: pickByRecency(local, remote, (row) => row.slot),
    duration_preset: pickByRecency(local, remote, (row) => row.duration_preset),
    duration_actual_sec:
      local.duration_actual_sec === null && remote.duration_actual_sec === null
        ? null
        : Math.max(local.duration_actual_sec ?? 0, remote.duration_actual_sec ?? 0),
    started_at:
      parseTimestamp(local.started_at) <= parseTimestamp(remote.started_at)
        ? local.started_at
        : remote.started_at,
    ended_at: pickLatestIso(local.ended_at, remote.ended_at),
    completed: local.completed || remote.completed,
    clarity:
      pickByRecency(local, remote, (row) => row.clarity) ??
      local.clarity ??
      remote.clarity ??
      null,
    note:
      pickByRecency(local, remote, (row) => row.note) ??
      local.note ??
      remote.note ??
      null,
    created_at:
      parseTimestamp(local.created_at) <= parseTimestamp(remote.created_at)
        ? local.created_at
        : remote.created_at,
  };
}

function sameSession(a: RestSessionRow, b: RestSessionRow): boolean {
  return (
    a.id === b.id &&
    a.user_id === b.user_id &&
    a.slot === b.slot &&
    a.duration_preset === b.duration_preset &&
    a.duration_actual_sec === b.duration_actual_sec &&
    a.started_at === b.started_at &&
    a.ended_at === b.ended_at &&
    a.completed === b.completed &&
    a.clarity === b.clarity &&
    a.note === b.note &&
    a.created_at === b.created_at
  );
}

function isWithinRetention(session: RestSessionRow, retentionStartMs: number): boolean {
  return parseTimestamp(session.started_at) >= retentionStartMs;
}

export async function syncRestSessionsBidirectional({
  userId,
  localRestSessions,
  remoteRestSessions,
  now = () => new Date(),
  freeRetentionDays = DEFAULT_FREE_RETENTION_DAYS,
  fetchLimit = DEFAULT_FETCH_LIMIT,
}: RestSessionSyncDependencies): Promise<RestSessionSyncResult> {
  if (!userId) {
    return {
      pushedToRemote: 0,
      pulledFromRemote: 0,
      mergedRows: 0,
      skippedOutsideRetention: 0,
    };
  }

  const retentionStartMs = now().getTime() - freeRetentionDays * 24 * 60 * 60 * 1000;
  const [localRows, remoteRows] = await Promise.all([
    localRestSessions.listByUser(userId, fetchLimit),
    remoteRestSessions.listByUser(userId, fetchLimit),
  ]);

  const localMap = new Map<string, RestSessionRow>();
  const remoteMap = new Map<string, RestSessionRow>();
  let skippedOutsideRetention = 0;

  for (const row of localRows) {
    if (!isWithinRetention(row, retentionStartMs)) {
      skippedOutsideRetention += 1;
      continue;
    }

    localMap.set(row.id, row);
  }

  for (const row of remoteRows) {
    if (!isWithinRetention(row, retentionStartMs)) {
      skippedOutsideRetention += 1;
      continue;
    }

    remoteMap.set(row.id, row);
  }

  let pushedToRemote = 0;
  let pulledFromRemote = 0;
  let mergedRows = 0;

  const ids = new Set([...localMap.keys(), ...remoteMap.keys()]);

  for (const id of ids) {
    const localRow = localMap.get(id);
    const remoteRow = remoteMap.get(id);

    if (localRow && !remoteRow) {
      await remoteRestSessions.upsert(localRow);
      pushedToRemote += 1;
      continue;
    }

    if (!localRow && remoteRow) {
      await localRestSessions.upsert(remoteRow);
      pulledFromRemote += 1;
      continue;
    }

    if (!localRow || !remoteRow) {
      continue;
    }

    const merged = mergeRestSessionRows(localRow, remoteRow);

    if (!sameSession(localRow, merged)) {
      await localRestSessions.upsert(merged);
      pulledFromRemote += 1;
    }

    if (!sameSession(remoteRow, merged)) {
      await remoteRestSessions.upsert(merged);
      pushedToRemote += 1;
    }

    if (!sameSession(localRow, remoteRow)) {
      mergedRows += 1;
    }
  }

  return {
    pushedToRemote,
    pulledFromRemote,
    mergedRows,
    skippedOutsideRetention,
  };
}
