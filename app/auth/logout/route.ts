import { NextResponse } from "next/server";

import { clearLocalOnlyUser } from "@/lib/supabase/auth.server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await request.formData();

  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearLocalOnlyUser();

  const destination = new URL("/settings", request.url);
  destination.searchParams.set("auth", "signed_out");

  return NextResponse.redirect(destination, 303);
}
