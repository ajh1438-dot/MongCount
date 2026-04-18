"use client";

import { useEffect } from "react";

import type { ThemePreference } from "@/lib/db/types";
import {
  applyResolvedThemeMode,
  getSystemPrefersDark,
  readStoredThemePreference,
  resolveThemeMode,
  writeStoredThemePreference,
} from "@/stores/theme-store";

export function ThemeModeSync({ preference = "system" }: { preference?: ThemePreference }) {
  useEffect(() => {
    const root = document.documentElement;
    const storage = window.localStorage;
    const mediaQueryFactory = window.matchMedia?.bind(window);
    const storedPreference = readStoredThemePreference(storage);
    const activePreference = storedPreference ?? preference;

    writeStoredThemePreference(activePreference, storage);

    const apply = () => {
      applyResolvedThemeMode(
        resolveThemeMode(activePreference, {
          now: new Date(),
          systemPrefersDark: getSystemPrefersDark(mediaQueryFactory),
        }),
        root,
      );
    };

    apply();

    if (!mediaQueryFactory || activePreference !== "system") {
      return;
    }

    const mediaQuery = mediaQueryFactory("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener?.("change", apply);

    return () => {
      mediaQuery.removeEventListener?.("change", apply);
    };
  }, [preference]);

  return null;
}
