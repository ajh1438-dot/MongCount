"use client";

import { useEffect } from "react";

import type { ThemePreference } from "@/lib/db/types";
import {
  applyResolvedThemeMode,
  readStoredThemePreference,
  resolveThemeMode,
  writeStoredThemePreference,
} from "@/stores/theme-store";

export function ThemeModeSync({ preference = "forest" }: { preference?: ThemePreference }) {
  useEffect(() => {
    const root = document.documentElement;
    const storage = window.localStorage;
    const storedPreference = readStoredThemePreference(storage);
    const activePreference = storedPreference ?? preference;

    writeStoredThemePreference(activePreference, storage);
    applyResolvedThemeMode(resolveThemeMode(activePreference), root);
  }, [preference]);

  return null;
}
