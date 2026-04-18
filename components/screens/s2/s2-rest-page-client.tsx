"use client";

import { useEffect } from "react";

import {
  hydrateS1HomeStoreFromLocalStorage,
  parseDurationPreset,
  setLastUsedDuration,
  useS1HomeStore,
} from "@/stores/s1-home-store";

import { S2RestTimerScreen } from "./s2-rest-timer-screen";

interface S2RestPageClientProps {
  requestedDuration?: string;
  mode?: string;
}

export function S2RestPageClient({ requestedDuration, mode }: S2RestPageClientProps) {
  const storeDuration = useS1HomeStore((snapshot) => snapshot.lastUsedDuration);
  const parsedRequestedDuration = parseDurationPreset(requestedDuration);
  const activeDuration = parsedRequestedDuration ?? storeDuration;
  const restMode = mode === "readonly" ? "readonly" : "running";

  useEffect(() => {
    hydrateS1HomeStoreFromLocalStorage();
  }, []);

  useEffect(() => {
    if (parsedRequestedDuration) {
      setLastUsedDuration(parsedRequestedDuration);
    }
  }, [parsedRequestedDuration]);

  return <S2RestTimerScreen durationMinutes={activeDuration} mode={restMode} />;
}
