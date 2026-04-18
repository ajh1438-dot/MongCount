"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { upsertStoredRestSession } from "@/lib/db/rest-session-history";
import { loadRestReviewNoteDraft, saveRestReviewNoteDraft } from "@/lib/db/rest-review-notes";
import {
  flushRestReviewNoteOutbox,
  setupRestReviewNoteRecoverySync,
  syncRestReviewNoteNow,
} from "@/lib/sync/rest-review-notes";

const CLARITY_OPTIONS = [1, 2, 3, 4, 5] as const;
const DEFAULT_CLARITY = 3;
const ABORTED_CLARITY = 2;
const NOTE_MAX_LENGTH = 280;
const SAVE_DELAY_MS = 2000;
const NOTE_DEBOUNCE_MS = 500;
const STORAGE_KEY = "mongcount.rest-review.last";

const ACTIVITY_TAGS = [
  { id: "sitting", label: "앉아서" },
  { id: "walking", label: "산책하며" },
  { id: "lying", label: "누워서" },
  { id: "standing", label: "서서" },
  { id: "gazing", label: "멍하게" },
  { id: "breathing", label: "호흡하며" },
  { id: "stretching", label: "스트레칭" },
  { id: "eyes_closed", label: "눈감고" },
] as const;

interface RestReviewScreenProps {
  fromAbort?: boolean;
  sessionId?: string;
  durationMinutes?: number;
  startedAt?: string;
}

function persistReview(values: { clarity: number; note: string | null; skipped: boolean }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...values,
      ended_at: new Date().toISOString(),
    }),
  );
}

function resolveStartedAt(startedAt?: string) {
  if (!startedAt) {
    return new Date().toISOString();
  }

  const parsed = new Date(startedAt);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function RestReviewScreen({
  fromAbort = false,
  sessionId = "active",
  durationMinutes = 5,
  startedAt,
}: RestReviewScreenProps) {
  const timeoutRef = useRef<number | null>(null);
  const noteDebounceRef = useRef<number | null>(null);

  const [clarity, setClarity] = useState(fromAbort ? ABORTED_CLARITY : DEFAULT_CLARITY);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [note, setNote] = useState(() => loadRestReviewNoteDraft(sessionId));
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  function toggleActivity(id: string) {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const emoji = useMemo(() => {
    const emojis = ["☁︎", "☁︎☁︎", "☁︎☀︎", "☀︎☀︎", "☀︎☀︎☀︎"] as const;
    return emojis[clarity - 1] ?? emojis[DEFAULT_CLARITY - 1];
  }, [clarity]);
  const durationLabel = `${durationMinutes}분`;
  const heading = fromAbort ? `${durationLabel} 멍때림, 여기까지` : `${durationLabel} 멍때렸어요 ✓`;
  const subcopy = fromAbort ? "느낌만 가볍게 남기고 돌아가요." : "방금 멍이 어땠는지 짧게 남겨보세요.";

  useEffect(() => {
    if (noteDebounceRef.current !== null) {
      window.clearTimeout(noteDebounceRef.current);
    }

    noteDebounceRef.current = window.setTimeout(() => {
      saveRestReviewNoteDraft(sessionId, note);
      void flushRestReviewNoteOutbox();
    }, NOTE_DEBOUNCE_MS);

    return () => {
      if (noteDebounceRef.current !== null) {
        window.clearTimeout(noteDebounceRef.current);
      }
    };
  }, [note, sessionId]);

  useEffect(() => {
    const cleanup = setupRestReviewNoteRecoverySync();
    void flushRestReviewNoteOutbox();

    return () => {
      cleanup();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      if (noteDebounceRef.current !== null) {
        window.clearTimeout(noteDebounceRef.current);
      }
    };
  }, []);

  function handleSave() {
    if (isSaving) {
      return;
    }

    const trimmedNote = note.trim();
    const activityPrefix = selectedActivities.size > 0
      ? `[${ACTIVITY_TAGS.filter((t) => selectedActivities.has(t.id)).map((t) => t.label).join(", ")}] `
      : "";
    const persistedNote = (activityPrefix + trimmedNote).trim() || null;

    setIsSaving(true);
    setShowSavedToast(true);

    saveRestReviewNoteDraft(sessionId, persistedNote ?? "");
    persistReview({
      clarity,
      note: persistedNote,
      skipped: false,
    });
    upsertStoredRestSession({
      id: sessionId,
      user_id: "local_only",
      slot: "adhoc",
      duration_preset: durationMinutes === 10 ? 10 : durationMinutes === 5 ? 5 : 3,
      duration_actual_sec: durationMinutes * 60,
      started_at: resolveStartedAt(startedAt),
      ended_at: new Date().toISOString(),
      completed: !fromAbort,
      clarity,
      note: persistedNote,
      created_at: resolveStartedAt(startedAt),
    });

    void syncRestReviewNoteNow(sessionId, persistedNote ?? "");

    timeoutRef.current = window.setTimeout(() => {
      window.location.assign("/");
    }, SAVE_DELAY_MS);
  }

  function handleSkip() {
    saveRestReviewNoteDraft(sessionId, "");

    persistReview({
      clarity: DEFAULT_CLARITY,
      note: null,
      skipped: true,
    });
    upsertStoredRestSession({
      id: sessionId,
      user_id: "local_only",
      slot: "adhoc",
      duration_preset: durationMinutes === 10 ? 10 : durationMinutes === 5 ? 5 : 3,
      duration_actual_sec: durationMinutes * 60,
      started_at: resolveStartedAt(startedAt),
      ended_at: new Date().toISOString(),
      completed: false,
      clarity: DEFAULT_CLARITY,
      note: null,
      created_at: resolveStartedAt(startedAt),
    });
    window.location.assign("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 pb-10 pt-10">
      <section className="space-y-8">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">멍때림 기록</p>
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted">{subcopy}</p>
          {fromAbort ? (
            <p className="text-sm text-muted" data-testid="rest-review-aborted-state">
              중단한 멍때림도 기록으로 남길 수 있어요.
            </p>
          ) : null}
        </header>

        <section className="space-y-4 rounded-[24px] border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-medium">머리가 좀 풀렸나요?</p>
              <p className="mt-1 text-sm text-muted">1~5 중에 지금의 느낌을 골라보세요.</p>
            </div>
            <p className="text-2xl" aria-live="polite" data-testid="rest-review-emoji">
              {emoji}
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center justify-between gap-2"
              data-testid="rest-review-slider"
              role="radiogroup"
              aria-label="머리가 얼마나 맑나요? 1부터 5까지"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setClarity((prev) => Math.min(5, prev + 1));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setClarity((prev) => Math.max(1, prev - 1));
                }
              }}
            >
              {CLARITY_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={clarity === value}
                  aria-label={`${value}점`}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                    clarity === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground/40"
                  }`}
                  onClick={() => setClarity(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>뿌연</span>
              <span data-testid="rest-review-clarity-value">{clarity}/5</span>
              <span>맑은</span>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium">어떻게 쉬었나요?</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleActivity(tag.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedActivities.has(tag.id)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted hover:text-foreground"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border bg-surface p-5 shadow-sm">
          <label className="block text-sm font-medium" htmlFor="rest-review-note">
            한 줄로 남겨볼까요?
          </label>
          <textarea
            aria-label="한 줄 기록 입력"
            autoFocus
            className="min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary/40"
            data-testid="rest-review-note"
            id="rest-review-note"
            maxLength={NOTE_MAX_LENGTH}
            onChange={(event) => setNote(event.currentTarget.value)}
            placeholder="뭐가 보였어요? 아무것도 안 봐도 괜찮아요."
            value={note}
          />
          <div className="flex items-center justify-between text-xs text-muted">
            <span>짧게 남겨도 충분해요.</span>
            <span data-testid="rest-review-note-length">{note.length}/{NOTE_MAX_LENGTH}</span>
          </div>
        </section>
      </section>

      <section className="space-y-3 pt-6">
        {showSavedToast ? <Toast title="저장했어요 ✓" message="홈으로 돌아갈게요." /> : null}
        <Button fullWidth onClick={handleSave} disabled={isSaving} className="min-h-[56px] text-base font-semibold">
          {isSaving ? "저장 중…" : "저장"}
        </Button>
        <Button fullWidth onClick={handleSkip} variant="secondary">
          건너뛰기
        </Button>
      </section>
    </main>
  );
}
