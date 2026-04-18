import type { ThemePreference } from "@/lib/db/types";

export type ResolvedThemeMode = "forest" | "light" | "dark";

export const THEME_STORAGE_KEY = "mongcount.theme";

export function resolveThemeMode(
  preference: ThemePreference,
): ResolvedThemeMode {
  if (preference === "light") {
    return "light";
  }

  if (preference === "dark") {
    return "dark";
  }

  return "forest";
}

export function readStoredThemePreference(storage: Pick<Storage, "getItem"> | null | undefined) {
  const value = storage?.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" || value === "forest" ? value : null;
}

export function writeStoredThemePreference(
  preference: ThemePreference,
  storage: Pick<Storage, "setItem"> | null | undefined,
) {
  storage?.setItem(THEME_STORAGE_KEY, preference);
}

export function getSystemPrefersDark(
  mediaQueryFactory: ((query: string) => Pick<MediaQueryList, "matches">) | undefined,
) {
  if (!mediaQueryFactory) {
    return false;
  }

  return mediaQueryFactory("(prefers-color-scheme: dark)").matches;
}

export function applyResolvedThemeMode(
  mode: ResolvedThemeMode,
  root: Pick<HTMLElement, "dataset" | "style"> | null | undefined,
) {
  if (!root) {
    return;
  }

  root.dataset.theme = mode;
  root.style.colorScheme = mode === "dark" ? "dark" : "light";
}
