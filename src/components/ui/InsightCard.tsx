"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import type { Insight, InsightLevel } from "@/lib/insights/types";

// ─── Level config ────────────────────────────────────────────────────────────

interface LevelCfg {
  icon: React.ElementType;
  color: string;
  bg: string;
  darkBg: string;
  border: string;
  darkBorder: string;
  chipColor: "error" | "warning" | "success" | "info" | "secondary";
}

const LEVEL_CFG: Record<InsightLevel, LevelCfg> = {
  danger: {
    icon: TrendingDownRoundedIcon,
    color: "#ef4444",
    bg: "#fef2f2",
    darkBg: "rgba(239,68,68,0.08)",
    border: "#fecaca",
    darkBorder: "rgba(239,68,68,0.20)",
    chipColor: "error",
  },
  warning: {
    icon: WarningAmberRoundedIcon,
    color: "#f59e0b",
    bg: "#fffbeb",
    darkBg: "rgba(245,158,11,0.08)",
    border: "#fde68a",
    darkBorder: "rgba(245,158,11,0.20)",
    chipColor: "warning",
  },
  success: {
    icon: CheckCircleOutlineRoundedIcon,
    color: "#22c55e",
    bg: "#f0fdf4",
    darkBg: "rgba(34,197,94,0.08)",
    border: "#bbf7d0",
    darkBorder: "rgba(34,197,94,0.20)",
    chipColor: "success",
  },
  info: {
    icon: LightbulbOutlinedIcon,
    color: "#3b82f6",
    bg: "#eff6ff",
    darkBg: "rgba(59,130,246,0.08)",
    border: "#bfdbfe",
    darkBorder: "rgba(59,130,246,0.20)",
    chipColor: "info",
  },
  tip: {
    icon: AutoAwesomeRoundedIcon,
    color: "#8b5cf6",
    bg: "#faf5ff",
    darkBg: "rgba(139,92,246,0.08)",
    border: "#e9d5ff",
    darkBorder: "rgba(139,92,246,0.20)",
    chipColor: "secondary",
  },
};

// ─── Single insight row ───────────────────────────────────────────────────────

function InsightRow({ insight, isDark, compact = false }: { insight: Insight; isDark: boolean; compact?: boolean }) {
  const cfg = LEVEL_CFG[insight.level];
  const Icon = cfg.icon;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: compact ? 1.5 : 0,
        ...(compact && {
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        }),
      }}
    >
      <Box
        sx={{
          mt: "2px",
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: isDark ? cfg.darkBg : cfg.bg,
          border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16, color: cfg.color }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.25 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4 }}
          >
            {insight.title}
          </Typography>
          {insight.metric && (
            <Chip
              label={insight.metric}
              size="small"
              color={cfg.chipColor}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {insight.body}
        </Typography>
        {insight.action && insight.actionHref && (
          <Box sx={{ mt: 0.5 }}>
            <Button
              component={Link}
              href={insight.actionHref}
              size="small"
              variant="text"
              sx={{
                fontSize: "0.72rem",
                color: cfg.color,
                fontWeight: 700,
                p: 0,
                minWidth: 0,
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
              }}
            >
              {insight.action} →
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── InsightCard ──────────────────────────────────────────────────────────────

interface InsightCardProps {
  insights: Insight[];
  loading?: boolean;
}

export function InsightCard({ insights, loading = false }: InsightCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={72}
        sx={{ borderRadius: 3, mb: 0 }}
      />
    );
  }

  if (insights.length === 0) return null;

  const [primary, ...rest] = insights;
  const cfg = LEVEL_CFG[primary.level];

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`,
        borderLeft: `4px solid ${cfg.color}`,
        bgcolor: isDark ? cfg.darkBg : cfg.bg,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: "14px 16px !important" }}>
        {/* Primary insight */}
        <InsightRow insight={primary} isDark={isDark} />

        {/* Expand / collapse for additional insights */}
        {rest.length > 0 && (
          <>
            <Collapse in={expanded}>
              <Box sx={{ mt: 0.5 }}>
                {rest.map((ins) => (
                  <InsightRow key={ins.id} insight={ins} isDark={isDark} compact />
                ))}
              </Box>
            </Collapse>
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setExpanded((v) => !v)}
                endIcon={expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                sx={{
                  fontSize: "0.72rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  p: "2px 6px",
                  minHeight: 0,
                  "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
                }}
              >
                {expanded ? "Menos" : `+${rest.length} análise${rest.length > 1 ? "s" : ""}`}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
