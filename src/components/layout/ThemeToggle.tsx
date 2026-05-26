"use client";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import { useThemeMode } from "@/components/providers/ThemeContext";

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const [spinning, setSpinning] = useState(false);
  const isDark = mode === "dark";

  const handleClick = () => {
    setSpinning(true);
    toggle();
    setTimeout(() => setSpinning(false), 420);
  };

  return (
    <Tooltip title={isDark ? "Modo claro" : "Modo escuro"} placement="bottom">
      <IconButton
        onClick={handleClick}
        size="small"
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: isDark ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.10)",
          border: "1px solid",
          borderColor: isDark ? "rgba(129,140,248,0.35)" : "rgba(255,255,255,0.18)",
          color: isDark ? "#a5b4fc" : "rgba(255,255,255,0.85)",
          boxShadow: isDark ? "0 0 10px rgba(129,140,248,0.45), 0 0 20px rgba(129,140,248,0.15)" : "none",
          transition: "all 0.3s ease",
          "& svg": {
            transition: "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)",
            transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
          },
          "&:hover": {
            bgcolor: isDark ? "rgba(129,140,248,0.28)" : "rgba(255,255,255,0.18)",
            boxShadow: isDark
              ? "0 0 16px rgba(129,140,248,0.65), 0 0 32px rgba(129,140,248,0.2)"
              : "0 0 8px rgba(255,255,255,0.25)",
            transform: "scale(1.05)",
          },
        }}
      >
        {isDark ? (
          <WbSunnyRoundedIcon sx={{ fontSize: 17 }} />
        ) : (
          <NightlightRoundIcon sx={{ fontSize: 17 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
