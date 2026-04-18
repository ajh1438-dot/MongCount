import { cookies } from "next/headers";

import type { UserRow } from "@/lib/db/types";
import {
  AUTH_MIGRATION_COOKIE_MAX_AGE_SECONDS,
  AUTH_MIGRATION_USER_ID_COOKIE,
  LOCAL_ONLY_COOKIE,
  mapProvider,
  ONE_YEAR_SECONDS,
} from "@/lib/supabase/auth.shared";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function exchangeCodeForSession(code: string) {
  const supabase = await createServerClient();
  return supabase.auth.exchangeCodeForSession(code);
}

export async function getCurrentUserProfile(): Promise<UserRow | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    display_name: user.user_metadata.display_name ?? user.user_metadata.name ?? null,
    provider: mapProvider(user.app_metadata.provider),
    created_at: user.created_at,
  };
}

export async function markLocalOnlyUser() {
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_ONLY_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export async function clearLocalOnlyUser() {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_ONLY_COOKIE);
}

export async function markPendingAuthMigration(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_MIGRATION_USER_ID_COOKIE, userId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MIGRATION_COOKIE_MAX_AGE_SECONDS,
  });
}

export async function isLocalOnlyUser() {
  const cookieStore = await cookies();
  return cookieStore.get(LOCAL_ONLY_COOKIE)?.value === "true";
}

export async function resolveEntryUser() {
  const user = await getCurrentUserProfile();

  if (user) {
    await clearLocalOnlyUser();
    return user;
  }

  if (await isLocalOnlyUser()) {
    return {
      id: "local-only",
      email: null,
      display_name: null,
      provider: "local_only" as const,
      created_at: new Date(0).toISOString(),
    };
  }

  return null;
}
