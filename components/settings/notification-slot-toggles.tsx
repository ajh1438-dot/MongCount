"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createDexieRepositories } from "@/lib/db/adapters/dexie";
import type { NotificationSlotConfig } from "@/lib/db/types";
import {
  DEFAULT_SLOT_CONFIGS,
  UserPreferencesService,
  createDefaultNotificationSlots,
  createDefaultSlotConfig,
  createDefaultUserPreferences,
} from "@/lib/db/user-preferences-service";

const MAX_SLOTS = 10;

type NotificationSlotsMap = Record<string, boolean>;
type SlotConfigMap = Record<string, NotificationSlotConfig>;
type SlotEntry = { key: string } & NotificationSlotConfig;

type PreferencesServicePort = Pick<UserPreferencesService, "getLocalOnlyPreferences" | "saveLocalFirst">;

function createFallbackPreferencesService(): PreferencesServicePort {
  const fallbackUserId = "local-fallback-user";
  let notificationSlots: NotificationSlotsMap = createDefaultNotificationSlots();
  let slotConfig: SlotConfigMap = createDefaultSlotConfig();

  return {
    async getLocalOnlyPreferences() {
      return createDefaultUserPreferences(fallbackUserId, {
        notification_slots: notificationSlots,
        notification_slot_config: slotConfig,
      });
    },
    async saveLocalFirst(userId, patch) {
      notificationSlots = { ...notificationSlots, ...patch.notification_slots };
      slotConfig = { ...slotConfig, ...patch.notification_slot_config };

      return createDefaultUserPreferences(userId, {
        ...patch,
        notification_slots: notificationSlots,
        notification_slot_config: slotConfig,
      });
    },
  };
}

function createNotificationPreferencesService(): PreferencesServicePort {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return createFallbackPreferencesService();
  }

  const repositories = createDexieRepositories();
  return new UserPreferencesService({ localRepository: repositories.preferences });
}

function isLegacyConfig(v: unknown): v is Record<string, { time: string; label: string }> {
  if (!v || typeof v !== "object") return false;
  const first = Object.values(v)[0];
  return !!first && typeof first === "object" && "time" in first && !("id" in first);
}

function migrateLegacyConfig(stored: Record<string, { time: string; label: string }>): SlotConfigMap {
  const result: SlotConfigMap = {};
  for (const [key, val] of Object.entries(stored)) {
    result[key] = { id: key, ...val };
  }
  return result;
}

function hydrateEntries(stored?: SlotConfigMap | null): SlotEntry[] {
  if (!stored || Object.keys(stored).length === 0) {
    return DEFAULT_SLOT_CONFIGS.map((cfg) => ({ key: cfg.id, ...cfg }));
  }

  let config = stored;
  if (isLegacyConfig(stored)) {
    config = migrateLegacyConfig(stored);
  }

  return Object.entries(config).map(([key, val]) => ({
    key,
    ...(val.id ? val : { ...val, id: key }),
  }));
}

function generateId(): string {
  return `slot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function findNextAvailableTime(existingTimes: Set<string>): string {
  const candidates = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00",
  ];
  return candidates.find((t) => !existingTimes.has(t)) ?? "12:00";
}

function ToggleSwitch({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors ${checked ? "bg-primary" : "bg-muted/30"}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[20px]" : "translate-x-0"}`}
      />
    </button>
  );
}

function formatTimeWithPeriod(time: string) {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${String(displayHour).padStart(2, "0")}:${minuteStr}`;
}

function InlineTimeInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }, [draft, value, onSave]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="time"
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className="rounded border border-border bg-transparent px-1 py-0.5 text-base font-semibold tabular-nums"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className="cursor-pointer rounded px-1 py-0.5 text-base font-semibold tabular-nums transition-colors hover:bg-muted/20"
      title="시간 편집"
    >
      {formatTimeWithPeriod(value)}
    </button>
  );
}

function InlineLabelInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
  }, [draft, value, onSave]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        maxLength={30}
        className="w-full rounded border border-border bg-transparent px-1 py-0.5 text-sm"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className="cursor-pointer rounded px-1 py-0.5 text-sm text-muted transition-colors hover:bg-muted/20"
      title="설명 편집"
    >
      {value}
    </button>
  );
}

function DeleteConfirmRow({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-foreground">이 알림을 삭제할까요?</span>
      <button type="button" onClick={onConfirm} className="text-red-500 hover:text-red-600 font-medium">삭제</button>
      <button type="button" onClick={onCancel} className="text-muted hover:text-foreground">취소</button>
    </div>
  );
}

export function NotificationSlotToggles({
  preferencesService,
}: {
  preferencesService?: PreferencesServicePort;
}) {
  const service = useMemo<PreferencesServicePort>(
    () => preferencesService ?? createNotificationPreferencesService(),
    [preferencesService],
  );

  const [userId, setUserId] = useState<string | null>(null);
  const [slotStates, setSlotStates] = useState<NotificationSlotsMap>({});
  const [entries, setEntries] = useState<SlotEntry[]>(() =>
    DEFAULT_SLOT_CONFIGS.map((cfg) => ({ key: cfg.id, ...cfg })),
  );
  const [savedFeedback, setSavedFeedback] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const preferences = await service.getLocalOnlyPreferences();

      if (!isMounted) return;

      setUserId(preferences.user_id);
      setSlotStates({
        ...createDefaultNotificationSlots(),
        ...preferences.notification_slots,
      });
      setEntries(hydrateEntries(preferences.notification_slot_config));
    })();

    return () => { isMounted = false; };
  }, [service]);

  const showSaved = useCallback(() => {
    setSavedFeedback(Date.now());
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setSavedFeedback(null), 1500);
  }, []);

  const persistAll = useCallback(async (newEntries: SlotEntry[], newSlotStates: NotificationSlotsMap) => {
    const resolvedUserId = userId ?? (await service.getLocalOnlyPreferences()).user_id;
    if (!userId) setUserId(resolvedUserId);

    const configMap: SlotConfigMap = {};
    for (const entry of newEntries) {
      configMap[entry.key] = { id: entry.id, time: entry.time, label: entry.label };
    }

    await service.saveLocalFirst(resolvedUserId, {
      notification_slots: newSlotStates,
      notification_slot_config: configMap,
    });
    showSaved();
  }, [userId, service, showSaved]);

  const persistSlotState = useCallback(async (time: string, enabled: boolean) => {
    const resolvedUserId = userId ?? (await service.getLocalOnlyPreferences()).user_id;
    if (!userId) setUserId(resolvedUserId);

    await service.saveLocalFirst(resolvedUserId, {
      notification_slots: { [time]: enabled },
    });
    showSaved();
  }, [userId, service, showSaved]);

  const persistSlotConfig = useCallback(async (key: string, config: NotificationSlotConfig) => {
    const resolvedUserId = userId ?? (await service.getLocalOnlyPreferences()).user_id;
    if (!userId) setUserId(resolvedUserId);

    await service.saveLocalFirst(resolvedUserId, {
      notification_slot_config: { [key]: config },
    });
    showSaved();
  }, [userId, service, showSaved]);

  const handleToggle = useCallback((entry: SlotEntry, enabled: boolean) => {
    setSlotStates((prev) => ({ ...prev, [entry.time]: enabled }));
    void persistSlotState(entry.time, enabled);
  }, [persistSlotState]);

  const handleTimeChange = useCallback((index: number, newTime: string) => {
    setEntries((prev) => {
      const next = [...prev];
      const old = next[index];
      next[index] = { ...old, time: newTime };
      void persistSlotConfig(old.key, { id: old.id, time: newTime, label: old.label });

      setSlotStates((ss) => {
        const wasEnabled = ss[old.time] ?? true;
        const updated = { ...ss };
        delete updated[old.time];
        updated[newTime] = wasEnabled;
        void persistSlotState(old.time, false).then(() => persistSlotState(newTime, wasEnabled));
        return updated;
      });

      return next;
    });
  }, [persistSlotConfig, persistSlotState]);

  const handleLabelChange = useCallback((index: number, newLabel: string) => {
    setEntries((prev) => {
      const next = [...prev];
      const old = next[index];
      next[index] = { ...old, label: newLabel };
      void persistSlotConfig(old.key, { id: old.id, time: old.time, label: newLabel });
      return next;
    });
  }, [persistSlotConfig]);

  const handleAdd = useCallback(() => {
    if (entries.length >= MAX_SLOTS) return;

    const existingTimes = new Set(entries.map((e) => e.time));
    const time = findNextAvailableTime(existingTimes);
    const id = generateId();

    const newEntry: SlotEntry = { key: id, id, time, label: "새 알림" };

    setEntries((prev) => [...prev, newEntry]);
    setSlotStates((prev) => ({ ...prev, [time]: true }));

    const nextEntries = [...entries, newEntry];
    const nextStates = { ...slotStates, [time]: true };
    void persistAll(nextEntries, nextStates);
  }, [entries, slotStates, persistAll]);

  const handleDeleteRequest = useCallback((key: string) => {
    setPendingDelete(key);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;

    const target = entries.find((e) => e.key === pendingDelete);
    if (!target) { setPendingDelete(null); return; }

    const nextEntries = entries.filter((e) => e.key !== pendingDelete);
    const nextStates = { ...slotStates };
    delete nextStates[target.time];

    setEntries(nextEntries);
    setSlotStates(nextStates);
    setPendingDelete(null);
    void persistAll(nextEntries, nextStates);
  }, [pendingDelete, entries, slotStates, persistAll]);

  const handleDeleteCancel = useCallback(() => {
    setPendingDelete(null);
  }, []);

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const enabled = slotStates[entry.time] ?? true;
        const isDeleting = pendingDelete === entry.key;

        if (isDeleting) {
          return (
            <div key={entry.key} className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 dark:border-red-900/40 dark:bg-red-950/20">
              <DeleteConfirmRow
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
              />
            </div>
          );
        }

        return (
          <div key={entry.key} className="flex items-center justify-between gap-3 py-1">
            <div className="flex flex-1 min-w-0 flex-col gap-0.5 items-start">
              <InlineTimeInput
                value={entry.time}
                onSave={(v) => handleTimeChange(i, v)}
              />
              <InlineLabelInput
                value={entry.label}
                onSave={(v) => handleLabelChange(i, v)}
              />
            </div>
            <div className="flex items-center gap-2">
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(entry.key)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted/20 hover:text-foreground"
                  aria-label={`${entry.time} 알림 삭제`}
                >
                  ×
                </button>
              )}
              <ToggleSwitch
                checked={enabled}
                onChange={(v) => handleToggle(entry, v)}
                ariaLabel={`알림 ${entry.time} 활성화 상태: ${enabled ? "켜짐" : "꺼짐"}`}
              />
            </div>
          </div>
        );
      })}

      {entries.length < MAX_SLOTS && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          ＋ 알림 시간 추가
        </button>
      )}

      {savedFeedback !== null && (
        <p className="text-xs text-primary">저장됨</p>
      )}
    </div>
  );
}
