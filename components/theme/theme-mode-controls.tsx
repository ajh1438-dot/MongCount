"use client";

import { useMemo, useState } from "react";

import type { ThemePreference } from "@/lib/db/types";
import {
  applyResolvedThemeMode,
  readStoredThemePreference,
  resolveThemeMode,
  writeStoredThemePreference,
} from "@/stores/theme-store";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "forest", label: "포레스트" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  const storage = window.localStorage;

  writeStoredThemePreference(preference, storage);
  applyResolvedThemeMode(resolveThemeMode(preference), root);
}

export function ThemeModeControls({ initialPreference = "forest" }: { initialPreference?: ThemePreference }) {
  const initialValue = useMemo<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return initialPreference;
    }

    return readStoredThemePreference(window.localStorage) ?? initialPreference;
  }, [initialPreference]);

  const [preference, setPreference] = useState<ThemePreference>(initialValue);

  const handlePreferenceChange = (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    applyThemePreference(nextPreference);
  };

  return (
    <div
      className="inline-flex w-full rounded-xl border bg-background p-1"
      role="radiogroup"
      aria-label="화면 모드 선택"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={preference === option.value}
          onClick={() => handlePreferenceChange(option.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            preference === option.value
              ? "bg-foreground text-background shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
