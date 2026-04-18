import { AuthErrorToast } from "@/app/auth/auth-error-toast";
import { AuthMigrationBridge } from "@/app/auth/auth-migration-bridge";
import { S1HomeStateScreen } from "@/components/screens/s1/s1-home-state-screen";
import { resolveEntryUser } from "@/lib/supabase/auth.server";

export default async function HomePage() {
  const user = await resolveEntryUser();
  const isGuest = !user || user.provider === "local_only";

  return (
    <>
      <AuthErrorToast />
      <AuthMigrationBridge />
      <S1HomeStateScreen displayName={user?.display_name} isGuest={isGuest} userId={user?.id} />
    </>
  );
}
