import { NextResponse, type NextRequest } from "next/server";

import {
  clearLocalOnlyUser,
  exchangeCodeForSession,
  getCurrentUserProfile,
  markPendingAuthMigration,
} from "@/lib/supabase/auth.server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = new URL("/", request.url);

  if (!code) {
    destination.searchParams.set("auth_error", "no_code");
    return NextResponse.redirect(destination);
  }

  const { error } = await exchangeCodeForSession(code);

  if (error) {
    destination.searchParams.set("auth_error", "exchange_failed");
    return NextResponse.redirect(destination);
  }

  const user = await getCurrentUserProfile();

  if (user) {
    await markPendingAuthMigration(user.id);
  }

  await clearLocalOnlyUser();
  return NextResponse.redirect(destination);
}
