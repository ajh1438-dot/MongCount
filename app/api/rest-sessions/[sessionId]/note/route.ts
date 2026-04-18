import { NextResponse } from "next/server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { SUPABASE_TABLES } from "@/lib/supabase/tables";

interface RestSessionNoteBody {
  note?: unknown;
}

function normalizeNote(note: unknown) {
  if (typeof note !== "string") {
    return null;
  }

  const trimmed = note.trim();

  if (trimmed.length > 280) {
    return { error: "note_too_long" } as const;
  }

  return {
    note: trimmed ? trimmed : null,
  } as const;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const body = (await request.json()) as RestSessionNoteBody;
  const normalized = normalizeNote(body.note);

  if (!normalized || "error" in normalized) {
    return NextResponse.json({ error: "invalid_note" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.restSessions)
    .update({ note: normalized.note })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "note_update_failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: sessionId });
}
