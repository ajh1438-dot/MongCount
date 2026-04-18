"use client";

import { useSyncExternalStore } from "react";

export type DurationPreset = 3 | 5 | 10;

export interface TodayProgressState {
  completedCount: number;
  targetCount: number;
  nextSlotTime: string | null;
  nextSlotInMinutes: number | null;
  softStreakDays: number;
}

export interface LastSessionSummary {
  relativeTime: string;
  clarityCount: number;
}

interface S1HomeState {
  todayProgress: TodayProgressState;
  lastSession: LastSessionSummary | null;
  lastUsedDuration: DurationPreset;
}

const DURATION_PRESETS: DurationPreset[] = [3, 5, 10];
const TODAY_PROGRESS_STORAGE_KEY = "mongcount.s1.todayProgress";
const LAST_SESSION_STORAGE_KEY = "mongcount.s1.lastSession";
const LAST_USED_DURATION_STORAGE_KEY = "mongcount.s1.lastUsedDuration";

const DEFAULT_STATE: S1HomeState = {
  todayProgress: {
    completedCount: 3,
    targetCount: 6,
    nextSlotTime: "19:00",
    nextSlotInMinutes: 120,
    softStreakDays: 2,
  },
  lastSession: {
    relativeTime: "10분 전",
    clarityCount: 3,
  },
  lastUsedDuration: 3,
};

let state: S1HomeState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function isDurationPreset(value: unknown): value is DurationPreset {
  return typeof value === "number" && DURATION_PRESETS.includes(value as DurationPreset);
}

function clampInt(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function clampNullableInt(value: unknown, fallback: number | null) {
  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function mergeTodayProgress(input: unknown): TodayProgressState {
  if (!input || typeof input !== "object") {
    return state.todayProgress;
  }

  const raw = input as Partial<TodayProgressState>;
  const targetCount = clampInt(raw.targetCount, state.todayProgress.targetCount || 6);

  return {
    completedCount: Math.min(clampInt(raw.completedCount, state.todayProgress.completedCount), targetCount),
    targetCount,
    nextSlotTime:
      raw.nextSlotTime === null
        ? null
        : typeof raw.nextSlotTime === "string" && raw.nextSlotTime.trim()
          ? raw.nextSlotTime
          : state.todayProgress.nextSlotTime,
    nextSlotInMinutes: clampNullableInt(raw.nextSlotInMinutes, state.todayProgress.nextSlotInMinutes),
    softStreakDays: clampInt(raw.softStreakDays, state.todayProgress.softStreakDays),
  };
}

function mergeLastSession(input: unknown): LastSessionSummary | null {
  if (input === null) {
    return null;
  }

  if (!input || typeof input !== "object") {
    return state.lastSession;
  }

  const raw = input as Partial<LastSessionSummary>;

  if (typeof raw.relativeTime !== "string" || !raw.relativeTime.trim()) {
    return state.lastSession;
  }

  return {
    relativeTime: raw.relativeTime,
    clarityCount: clampInt(raw.clarityCount, state.lastSession?.clarityCount ?? 0),
  };
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined" || typeof window.localStorage?.getItem !== "function") {
    return null;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (value === null) {
    if (typeof window.localStorage?.removeItem === "function") {
      window.localStorage.removeItem(key);
    }
    return;
  }

  if (typeof window.localStorage?.setItem === "function") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function readHydratedState() {
  const persistedTodayProgress = readJson<Partial<TodayProgressState>>(TODAY_PROGRESS_STORAGE_KEY);
  const persistedLastSession = readJson<Partial<LastSessionSummary> | null>(LAST_SESSION_STORAGE_KEY);
  const persistedDuration = readJson<unknown>(LAST_USED_DURATION_STORAGE_KEY);

  return {
    todayProgress: persistedTodayProgress ? mergeTodayProgress(persistedTodayProgress) : state.todayProgress,
    lastSession: persistedLastSession === null ? state.lastSession : mergeLastSession(persistedLastSession),
    lastUsedDuration: isDurationPreset(persistedDuration) ? persistedDuration : state.lastUsedDuration,
  } satisfies S1HomeState;
}

function hydrateFromStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  const nextState = readHydratedState();

  const changed =
    nextState.todayProgress.completedCount !== state.todayProgress.completedCount ||
    nextState.todayProgress.targetCount !== state.todayProgress.targetCount ||
    nextState.todayProgress.nextSlotTime !== state.todayProgress.nextSlotTime ||
    nextState.todayProgress.nextSlotInMinutes !== state.todayProgress.nextSlotInMinutes ||
    nextState.todayProgress.softStreakDays !== state.todayProgress.softStreakDays ||
    nextState.lastSession?.relativeTime !== state.lastSession?.relativeTime ||
    nextState.lastSession?.clarityCount !== state.lastSession?.clarityCount ||
    nextState.lastSession === null !== (state.lastSession === null) ||
    nextState.lastUsedDuration !== state.lastUsedDuration;

  if (!changed) {
    return false;
  }

  state = nextState;
  return true;
}

export function hydrateS1HomeStoreFromLocalStorage() {
  if (hydrateFromStorage()) {
    emitChange();
  }
}

export function subscribeS1HomeStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getS1HomeState() {
  return state;
}

export function useS1HomeStore<T>(selector: (value: S1HomeState) => T) {
  return useSyncExternalStore(
    subscribeS1HomeStore,
    () => selector(state),
    () => selector(DEFAULT_STATE),
  );
}

export function setTodayProgress(todayProgress: Partial<TodayProgressState>) {
  state = {
    ...state,
    todayProgress: mergeTodayProgress(todayProgress),
  };

  writeJson(TODAY_PROGRESS_STORAGE_KEY, state.todayProgress);
  emitChange();
}

export function setLastSession(lastSession: Partial<LastSessionSummary> | null) {
  state = {
    ...state,
    lastSession: mergeLastSession(lastSession),
  };

  writeJson(LAST_SESSION_STORAGE_KEY, state.lastSession);
  emitChange();
}

export function setLastUsedDuration(duration: number) {
  if (!isDurationPreset(duration)) {
    return;
  }

  state = {
    ...state,
    lastUsedDuration: duration,
  };

  writeJson(LAST_USED_DURATION_STORAGE_KEY, duration);
  emitChange();
}

export function parseDurationPreset(value: string | null | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  return isDurationPreset(parsed) ? parsed : null;
}
