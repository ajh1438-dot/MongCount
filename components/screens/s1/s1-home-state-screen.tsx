"use client";

import { useEffect } from "react";

import { S1HomeScreen } from "@/components/screens/s1/s1-home-screen";
import { hydrateS1HomeStoreFromLocalStorage, useS1HomeStore } from "@/stores/s1-home-store";

interface S1HomeStateScreenProps {
  displayName?: string | null;
  isGuest?: boolean;
  userId?: string | null;
}

export function S1HomeStateScreen({ displayName, isGuest = false }: S1HomeStateScreenProps) {
  const todayProgress = useS1HomeStore((snapshot) => snapshot.todayProgress);
  const lastSession = useS1HomeStore((snapshot) => snapshot.lastSession);
  const lastUsedDuration = useS1HomeStore((snapshot) => snapshot.lastUsedDuration);

  useEffect(() => {
    hydrateS1HomeStoreFromLocalStorage();
  }, []);

  return (
    <S1HomeScreen
      displayName={displayName}
      isGuest={isGuest}
      completedCount={todayProgress.completedCount}
      targetCount={todayProgress.targetCount}
      nextSlotTime={todayProgress.nextSlotTime}
      nextSlotInMinutes={todayProgress.nextSlotInMinutes}
      softStreakDays={todayProgress.softStreakDays}
      lastSession={lastSession}
      startDuration={lastUsedDuration}
    />
  );
}
