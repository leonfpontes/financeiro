"use client";

import type { PopoverContentProps } from "@reactour/tour";
import type { TourStepMeta } from "./types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

const KEYFRAMES = `
  @keyframes tourFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export function TourStepCard({
  steps,
  currentStep,
  setCurrentStep,
  setIsOpen,
}: PopoverContentProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const meta = steps[currentStep]?.content as unknown as TourStepMeta;
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const accent = meta?.accent ?? "#6366f1";

  const handleClose = () => {
    setIsOpen(false);
    try { localStorage.setItem("financeiro_tour_seen", "1"); } catch {}
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <Box
        sx={{
          animation: "tourFadeUp 0.22s ease both",
          width: 320,
          overflow: "hidden",
        }}
      >
        {/* Gradient banner */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${accent}ee 0%, ${accent}99 100%)`,
            height: 84,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            userSelect: "none",
            overflow: "hidden",
          }}
        >
          {/* Decorative bubbles */}
          <Box sx={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -18, left: -12, width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", top: 8, left: 20, width: 20, height: 20, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />
          <span
            style={{
              fontSize: "3rem",
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.25))",
              zIndex: 1,
              position: "relative",
              lineHeight: 1,
            }}
          >
            {meta?.emoji ?? "✨"}
          </span>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2.5, pt: 2 }}>
          {/* Counter + close */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Passo {currentStep + 1} de {totalSteps}
            </Typography>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isDark ? "#475569" : "#94a3b8",
                fontSize: "1rem",
                lineHeight: 1,
                padding: "2px 5px",
                borderRadius: 4,
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </Box>

          {/* Title */}
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1rem",
              mb: 1,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              color: "text.primary",
            }}
          >
            {meta?.title}
          </Typography>

          {/* Body */}
          <Typography
            sx={{
              fontSize: "0.82rem",
              color: "text.secondary",
              lineHeight: 1.7,
              mb: 2.5,
            }}
          >
            {meta?.body}
          </Typography>

          {/* Progress pills */}
          <Box sx={{ display: "flex", gap: 0.6, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
            {steps.map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrentStep(i)}
                sx={{
                  width: i === currentStep ? 22 : 6,
                  height: 6,
                  borderRadius: 3,
                  bgcolor:
                    i === currentStep
                      ? accent
                      : i < currentStep
                      ? `${accent}55`
                      : isDark
                      ? "rgba(255,255,255,0.10)"
                      : "#e2e8f0",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>

          {/* Nav buttons */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                color: isDark ? "#475569" : "#94a3b8",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "6px 0",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                letterSpacing: "0.01em",
              }}
            >
              Pular tour
            </button>

            <Box sx={{ display: "flex", gap: 0.75 }}>
              {!isFirst && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    background: isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: isDark ? "#94a3b8" : "#64748b",
                    fontFamily: "inherit",
                  }}
                >
                  ← Anterior
                </button>
              )}
              <button
                onClick={handleNext}
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 10,
                  padding: "8px 18px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "inherit",
                  boxShadow: `0 4px 12px ${accent}44`,
                  letterSpacing: "0.01em",
                }}
              >
                {isLast ? "🎉 Concluir!" : "Próximo →"}
              </button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
