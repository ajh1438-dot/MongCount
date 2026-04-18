import { NextResponse } from "next/server";

import { markLocalOnlyUser } from "@/lib/supabase/auth.server";

export async function POST(request: Request) {
  await request.formData();
  await markLocalOnlyUser();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
