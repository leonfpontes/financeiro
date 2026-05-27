"use client";

import { useState, useEffect } from "react";

type ViewMode = "list" | "grid";

/**
 * Manages a list/grid view mode toggle with localStorage persistence.
 * @param resource - Key prefix for localStorage (e.g. "entradas")
 * @param defaultMode - Initial mode before localStorage is read
 */
export function useViewMode(
  resource: string,
  defaultMode: ViewMode = "list",
): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    const saved = localStorage.getItem(`${resource}_view_mode`) as ViewMode | null;
    if (saved === "list" || saved === "grid") setViewModeState(saved);
  }, [resource]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(`${resource}_view_mode`, mode);
  };

  return [viewMode, setViewMode];
}
