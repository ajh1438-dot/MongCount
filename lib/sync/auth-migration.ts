import { createDexieRepositories } from "@/lib/db/adapters/dexie";
import { UserPreferencesService, LOCAL_ONLY_USER_ID_STORAGE_KEY } from "@/lib/db/user-preferences-service";
import type {
  RestSessionRepository,
  UserPreferencesRepository,
} from "@/lib/db/repositories";
import type { RestSessionRow } from "@/lib/db/types";
import { createSupabaseRepositories } from "@/lib/db/adapters/supabase";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { AUTH_MIGRATION_USER_ID_COOKIE } from "@/lib/supabase/auth.shared";

const AUTHENTICATED_USER_ID_STORAGE_KEY = "mongcount.authenticated_user_id";

type LocalStorageLike = Pick<Storage, "getItem" | "setItem">;

interface AuthMigrationRepositories {
  preferences: UserPreferencesRepository;
  restSessions: RestSessionRepository;
}

interface AuthMigrationRuntime {
  createLocalRepositories?: () => AuthMigrationRepositories;
  getRemoteRepositories?: (targetUserId: string) => Promise<AuthMigrationRepositories | null>;
  clearCookie?: (name: string) => void;
}

export interface AuthMigrationDependencies {
  sourceUserId: string;
  targetUserId: string;
  localRestSessions: RestSessionRepository;
  remoteRestSessions?: RestSessionRepository;
  preferencesService?: Pick<UserPreferencesService, "loadForSignedInUser">;
}

export interface AuthMigrationResult {
  migratedSessionCount: number;
  migratedPreferences: boolean;
}

export function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

export function clearCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

function cloneSessionForUser(session: RestSessionRow, userId: string): RestSessionRow {
  return {
    ...session,
    user_id: userId,
  };
}

export async function migrateAuthenticatedUserData({
  sourceUserId,
  targetUserId,
  localRestSessions,
  remoteRestSessions,
  preferencesService,
}: AuthMigrationDependencies): Promise<AuthMigrationResult> {
  if (!sourceUserId || !targetUserId || sourceUserId === targetUserId) {
    if (preferencesService) {
      await preferencesService.loadForSignedInUser(targetUserId);
    }

    return {
      migratedSessionCount: 0,
      migratedPreferences: Boolean(preferencesService),
    };
  }

  const sessions = await localRestSessions.listByUser(sourceUserId, 500);

  for (const session of sessions) {
    const migratedSession = cloneSessionForUser(session, targetUserId);
    await localRestSessions.upsert(migratedSession);

    if (remoteRestSessions) {
      await remoteRestSessions.upsert(migratedSession);
    }
  }

  if (preferencesService) {
    await preferencesService.loadForSignedInUser(targetUserId);
  }

  return {
    migratedSessionCount: sessions.length,
    migratedPreferences: Boolean(preferencesService),
  };
}

async function getRemoteRepositoriesForUser(targetUserId: string): Promise<AuthMigrationRepositories | null> {
  const supabase = createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id !== targetUserId) {
    return null;
  }

  const repositories = createSupabaseRepositories(supabase);
  return {
    preferences: repositories.preferences,
    restSessions: repositories.restSessions,
  };
}

export async function runPendingAuthMigration(
  storage: LocalStorageLike = window.localStorage,
  runtime: AuthMigrationRuntime = {},
) {
  const pendingTargetUserId = readCookie(AUTH_MIGRATION_USER_ID_COOKIE);

  if (!pendingTargetUserId) {
    return null;
  }

  const sourceUserId = storage.getItem(LOCAL_ONLY_USER_ID_STORAGE_KEY);

  const clearPendingCookie = runtime.clearCookie ?? clearCookie;

  if (!sourceUserId) {
    storage.setItem(AUTHENTICATED_USER_ID_STORAGE_KEY, pendingTargetUserId);
    clearPendingCookie(AUTH_MIGRATION_USER_ID_COOKIE);
    return {
      migratedSessionCount: 0,
      migratedPreferences: false,
    } satisfies AuthMigrationResult;
  }

  const localRepositories = runtime.createLocalRepositories?.() ?? createDexieRepositories();
  const remoteRepositories = await (runtime.getRemoteRepositories?.(pendingTargetUserId) ??
    getRemoteRepositoriesForUser(pendingTargetUserId));
  const preferencesService = new UserPreferencesService({
    localRepository: localRepositories.preferences,
    remoteRepository: remoteRepositories?.preferences,
    storage,
  });

  const result = await migrateAuthenticatedUserData({
    sourceUserId,
    targetUserId: pendingTargetUserId,
    localRestSessions: localRepositories.restSessions,
    remoteRestSessions: remoteRepositories?.restSessions,
    preferencesService,
  });

  storage.setItem(AUTHENTICATED_USER_ID_STORAGE_KEY, pendingTargetUserId);
  clearPendingCookie(AUTH_MIGRATION_USER_ID_COOKIE);

  return result;
}
