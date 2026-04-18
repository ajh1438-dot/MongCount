import { Suspense } from "react";

import { S2RestPageClient } from "@/components/screens/s2/s2-rest-page-client";

function RestPageFallback() {
  return <main className="min-h-screen bg-background" />;
}

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return value;
}

export default async function RestPage({
  searchParams,
}: {
  searchParams: Promise<{ duration?: string | string[] | undefined; mode?: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<RestPageFallback />}>
      <S2RestPageClient requestedDuration={pickFirst(params.duration)} mode={pickFirst(params.mode)} />
    </Suspense>
  );
}
