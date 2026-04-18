import type { UserRow } from "@/lib/db/types";

export const LOCAL_ONLY_COOKIE = "mongcount-local-only";
export const AUTH_MIGRATION_USER_ID_COOKIE = "mongcount-auth-migration-user-id";
export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
export const AUTH_MIGRATION_COOKIE_MAX_AGE_SECONDS = 60 * 5;

export function mapProvider(provider: string | undefined): UserRow["provider"] {
  if (provider === "google" || provider === "kakao") {
    return provider;
  }

  return "local_only";
}
