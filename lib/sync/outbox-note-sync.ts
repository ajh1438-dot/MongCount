export interface ReviewNotePayload {
  userId: string;
  clarity: number;
  note: string | null;
  endedAt: string;
}

export interface OutboxNoteSyncDependencies {
  debounceMs?: number;
  isOnline: () => boolean;
  syncRemote: (payload: ReviewNotePayload) => Promise<void>;
  enqueueOutbox: (payload: ReviewNotePayload) => Promise<void> | void;
  drainOutbox: () => Promise<ReviewNotePayload[]> | ReviewNotePayload[];
}

export interface OutboxNoteSyncController {
  schedule: (payload: ReviewNotePayload) => void;
  flushOutbox: () => Promise<number>;
  flushNow: () => Promise<void>;
  dispose: () => void;
}

const DEFAULT_DEBOUNCE_MS = 500;

export function createOutboxNoteSync({
  debounceMs = DEFAULT_DEBOUNCE_MS,
  isOnline,
  syncRemote,
  enqueueOutbox,
  drainOutbox,
}: OutboxNoteSyncDependencies): OutboxNoteSyncController {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPayload: ReviewNotePayload | null = null;

  async function enqueue(payload: ReviewNotePayload) {
    await enqueueOutbox(payload);
  }

  async function syncOrQueue(payload: ReviewNotePayload) {
    if (!isOnline()) {
      await enqueue(payload);
      return;
    }

    try {
      await syncRemote(payload);
    } catch {
      await enqueue(payload);
    }
  }

  function schedule(payload: ReviewNotePayload) {
    pendingPayload = payload;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      const next = pendingPayload;
      pendingPayload = null;
      timeoutId = null;

      if (!next) {
        return;
      }

      await syncOrQueue(next);
    }, debounceMs);
  }

  async function flushOutbox(): Promise<number> {
    if (!isOnline()) {
      return 0;
    }

    const queued = await drainOutbox();
    if (queued.length === 0) {
      return 0;
    }

    let flushed = 0;

    for (let index = 0; index < queued.length; index += 1) {
      const payload = queued[index];

      try {
        await syncRemote(payload);
        flushed += 1;
      } catch {
        await enqueue(payload);

        for (let nextIndex = index + 1; nextIndex < queued.length; nextIndex += 1) {
          await enqueue(queued[nextIndex]);
        }

        break;
      }
    }

    return flushed;
  }

  async function flushNow(): Promise<void> {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    const next = pendingPayload;
    pendingPayload = null;

    if (next) {
      await syncOrQueue(next);
    }

    await flushOutbox();
  }

  function dispose() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  return {
    schedule,
    flushOutbox,
    flushNow,
    dispose,
  };
}
