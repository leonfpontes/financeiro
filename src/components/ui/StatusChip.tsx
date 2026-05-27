"use client";

import Chip from "@mui/material/Chip";
import { useIsDark } from "@/hooks/useIsDark";

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  darkBg: string;
  border?: string;
  darkBorder?: string;
}

interface StatusChipProps {
  config: StatusConfig;
  size?: "small" | "medium";
}

/**
 * Renders a status badge that automatically adapts to light/dark mode
 * using the `darkBg` and `darkBorder` fields from the config object.
 */
export function StatusChip({ config, size = "small" }: StatusChipProps) {
  const isDark = useIsDark();
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: isDark ? config.darkBg : config.bg,
        color: config.color,
        fontWeight: 700,
        fontSize: "0.72rem",
        height: 22,
        ...(config.border && {
          border: `1px solid ${isDark ? (config.darkBorder ?? config.border) : config.border}`,
        }),
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
