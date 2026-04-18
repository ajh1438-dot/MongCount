import { createClient as createBrowserClient } from "@/lib/supabase/client";

export { AUTH_MIGRATION_USER_ID_COOKIE } from "@/lib/supabase/auth.shared";

export function createOAuthClient() {
  return createBrowserClient();
}

export async function startOAuthSignIn(provider: "google" | "kakao", redirectTo: string) {
  const supabase = createOAuthClient();

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
}
