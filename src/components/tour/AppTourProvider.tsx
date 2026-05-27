"use client";

import { useMemo, useState, useEffect } from "react";
import { TourProvider } from "@reactour/tour";
import { useTheme } from "@mui/material/styles";
import { TourStepCard } from "./TourStepCard";

interface AppTourProviderProps {
  children: React.ReactNode;
}

export function AppTourProvider({ children }: AppTourProviderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const paperBg = theme.palette.background.paper;

  const styles = useMemo(
    () => ({
      popover: (base: Record<string, unknown>) => ({
        ...base,
        padding: 0,
        borderRadius: 20,
        overflow: "hidden",
        maxWidth: 340,
        background: paperBg,
        boxShadow: isDark
          ? "0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)"
          : "0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
      }),
      maskWrapper: (base: Record<string, unknown>) => ({
        ...base,
        color: isDark ? "rgba(0,0,0,0.80)" : "rgba(0,0,0,0.65)",
      }),
      maskArea: (base: Record<string, unknown>) => ({
        ...base,
        rx: 12,
      }),
      badge: (base: Record<string, unknown>) => ({
        ...base,
        display: "none",
      }),
    }),
    [isDark, paperBg],
  );

  if (!mounted) return <>{children}</>;

  return (
    <TourProvider
      steps={[]}
      ContentComponent={TourStepCard}
      styles={styles}
      showBadge={false}
      showDots={false}
      showNavigation={false}
      scrollSmooth
      padding={{ mask: 10, popover: [6, 12] }}
    >
      {children}
    </TourProvider>
  );
}

