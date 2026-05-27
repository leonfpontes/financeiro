"use client";

import { useTheme } from "@mui/material/styles";

/** Returns true when the active MUI theme is in dark mode. */
export function useIsDark(): boolean {
  const theme = useTheme();
  return theme.palette.mode === "dark";
}
