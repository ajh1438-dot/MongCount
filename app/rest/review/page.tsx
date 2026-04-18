import { RestReviewScreen } from "@/components/screens/rest-review/rest-review-screen";

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return value;
}

function parseDuration(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.floor(parsed);
}

export default async function RestReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    from_abort?: string | string[] | undefined;
    session_id?: string | string[] | undefined;
    duration?: string | string[] | undefined;
    started_at?: string | string[] | undefined;
  }>;
}) {
  const params = await searchParams;
  const fromAbort = pickFirst(params.from_abort) === "true";
  const sessionId = pickFirst(params.session_id) ?? "active";
  const durationMinutes = parseDuration(pickFirst(params.duration));
  const startedAt = pickFirst(params.started_at);

  return (
    <RestReviewScreen
      fromAbort={fromAbort}
      sessionId={sessionId}
      durationMinutes={durationMinutes}
      startedAt={startedAt}
    />
  );
}
