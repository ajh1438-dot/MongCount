import type { UserPreferencesRepository } from "@/lib/db/repositories";
import type { NotificationSlotConfig, UserPreferencesRow } from "@/lib/db/types";

export const LOCAL_ONLY_USER_ID_STORAGE_KEY = "mongcount.local_only_user_id";
const FALLBACK_TIMEZONE = "Asia/Seoul";

export const DEFAULT_SLOT_CONFIGS: readonly NotificationSlotConfig[] = [
  { id: "default-0", time: "08:30", label: "출근 직후, 3분만 쉬었다가 시작해요", duration: 3 },
  { id: "default-1", time: "10:30", label: "오전 중반, 잠깐 멈추고 숨 고르기", duration: 3 },
  { id: "default-2", time: "13:00", label: "점심 후 머리를 비우는 시간", duration: 10 },
  { id: "default-3", time: "15:30", label: "오후 집중이 흐려질 때 환기", duration: 5 },
  { id: "default-4", time: "19:00", label: "퇴근 후 하루를 내려놓는 쉼", duration: 5 },
  { id: "default-5", time: "22:00", label: "잠들기 전, 오늘을 조용히 마무리", duration: 3 },
];

type LocalStorageLike = Pick<Storage, "getItem" | "setItem">;
type UserPreferencesPatch = Partial<Omit<UserPreferencesRow, "user_id">>;

export interface UserPreferencesServiceOptions {
  localRepository: UserPreferencesRepository;
  remoteRepository?: UserPreferencesRepository;
  storage?: LocalStorageLike;
  now?: () => string;
  generateId?: () => string;
}

export function createDefaultNotificationSlots(): UserPreferencesRow["notification_slots"] {
  return DEFAULT_SLOT_CONFIGS.reduce<Record<string, boolean>>((slots, cfg) => {
    slots[cfg.time] = true;
    return slots;
  }, {});
}

export function createDefaultSlotConfig(): Record<string, NotificationSlotConfig> {
  return DEFAULT_SLOT_CONFIGS.reduce<Record<string, NotificationSlotConfig>>((acc, cfg) => {
    acc[cfg.id] = { ...cfg };
    return acc;
  }, {});
}

export function resolveDefaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
}

export function createDefaultUserPreferences(
  userId: string,
  overrides: UserPreferencesPatch = {},
): UserPreferencesRow {
  return {
    user_id: userId,
    notification_slots: {
      ...createDefaultNotificationSlots(),
      ...overrides.notification_slots,
    },
    notification_slot_config: {
      ...createDefaultSlotConfig(),
      ...overrides.notification_slot_config,
    },
    theme: overrides.theme ?? "forest",
    onboarding_completed: overrides.onboarding_completed ?? false,
    timezone: overrides.timezone ?? resolveDefaultTimezone(),
    updated_at: overrides.updated_at ?? new Date().toISOString(),
  };
}

function resolveStorage(storage?: LocalStorageLike) {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined") {
    return window.localStorage;
  }

  return null;
}

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function pickLatestPreferences(
  ...rows: Array<UserPreferencesRow | null | undefined>
): UserPreferencesRow | null {
  return rows.reduce<UserPreferencesRow | null>((latest, candidate) => {
    if (!candidate) {
      return latest;
    }

    if (!latest) {
      return candidate;
    }

    return parseTimestamp(candidate.updated_at) > parseTimestamp(latest.updated_at)
      ? candidate
      : latest;
  }, null);
}

function buildStoredPreferences(userId: string, source?: UserPreferencesPatch | null) {
  return createDefaultUserPreferences(userId, source ?? undefined);
}

export class UserPreferencesService {
  private readonly localRepository: UserPreferencesRepository;
  private readonly remoteRepository?: UserPreferencesRepository;
  private readonly storage: LocalStorageLike | null;
  private readonly now: () => string;
  private readonly generateId: () => string;

  constructor(options: UserPreferencesServiceOptions) {
    this.localRepository = options.localRepository;
    this.remoteRepository = options.remoteRepository;
    this.storage = resolveStorage(options.storage);
    this.now = options.now ?? (() => new Date().toISOString());
    this.generateId = options.generateId ?? (() => globalThis.crypto.randomUUID());
  }

  readLocalOnlyUserId() {
    return this.storage?.getItem(LOCAL_ONLY_USER_ID_STORAGE_KEY) ?? null;
  }

  getOrCreateLocalOnlyUserId() {
    const existing = this.readLocalOnlyUserId();

    if (existing) {
      return existing;
    }

    const userId = this.generateId();
    this.storage?.setItem(LOCAL_ONLY_USER_ID_STORAGE_KEY, userId);
    return userId;
  }

  async getLocalOnlyPreferences() {
    const userId = this.getOrCreateLocalOnlyUserId();
    return this.ensureLocalPreferences(userId);
  }

  async ensureLocalPreferences(userId: string) {
    const existing = await this.localRepository.getByUserId(userId);

    if (existing) {
      return existing;
    }

    const defaults = createDefaultUserPreferences(userId, {
      updated_at: this.now(),
    });
    await this.localRepository.upsert(defaults);
    return defaults;
  }

  async saveLocalFirst(userId: string, patch: UserPreferencesPatch) {
    const current = await this.ensureLocalPreferences(userId);
    const nextPreferences = buildStoredPreferences(userId, {
      ...current,
      ...patch,
      notification_slots: {
        ...current.notification_slots,
        ...patch.notification_slots,
      },
      notification_slot_config: {
        ...current.notification_slot_config,
        ...patch.notification_slot_config,
      },
      updated_at: this.now(),
    });

    await this.localRepository.upsert(nextPreferences);

    if (this.remoteRepository) {
      await this.remoteRepository.upsert(nextPreferences);
    }

    return nextPreferences;
  }

  async loadForSignedInUser(userId: string) {
    const localOnlyUserId = this.readLocalOnlyUserId();
    const [localSignedIn, localOnly, remote] = await Promise.all([
      this.localRepository.getByUserId(userId),
      localOnlyUserId && localOnlyUserId !== userId
        ? this.localRepository.getByUserId(localOnlyUserId)
        : Promise.resolve(null),
      this.remoteRepository?.getByUserId(userId) ?? Promise.resolve(null),
    ]);

    const source = pickLatestPreferences(localOnly, localSignedIn, remote);
    const resolved = buildStoredPreferences(
      userId,
      source
        ? {
            notification_slots: source.notification_slots,
            notification_slot_config: source.notification_slot_config,
            theme: source.theme,
            onboarding_completed: source.onboarding_completed,
            timezone: source.timezone,
            updated_at: this.now(),
          }
        : { updated_at: this.now() },
    );

    await this.localRepository.upsert(resolved);

    if (this.remoteRepository) {
      await this.remoteRepository.upsert(resolved);
    }

    return resolved;
  }
}
