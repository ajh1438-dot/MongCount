import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/types";
import {
  AUTH_MIGRATION_COOKIE_MAX_AGE_SECONDS,
  AUTH_MIGRATION_USER_ID_COOKIE,
  LOCAL_ONLY_COOKIE,
  mapProvider,
} from "@/lib/supabase/auth.shared";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = new URL("/", request.url);

  if (!code) {
    destination.searchParams.set("auth_error", "no_code");
    return NextResponse.redirect(destination);
  }

  const response = NextResponse.redirect(destination);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      destination.searchParams.set("auth_error", "exchange_failed");
      return NextResponse.redirect(destination);
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      response.cookies.set(AUTH_MIGRATION_USER_ID_COOKIE, user.id, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: AUTH_MIGRATION_COOKIE_MAX_AGE_SECONDS,
      });
    }

    response.cookies.delete(LOCAL_ONLY_COOKIE);
  } catch {
    destination.searchParams.set("auth_error", "exchange_failed");
    return NextResponse.redirect(destination);
  }

  return response;
}
