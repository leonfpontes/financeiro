"use client";

import { useTour } from "@reactour/tour";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

interface TourButtonProps {
  tooltipPlacement?: "right" | "left" | "top" | "bottom";
  sx?: object;
}

export function TourButton({ tooltipPlacement = "right", sx }: TourButtonProps) {
  const { setIsOpen, setCurrentStep } = useTour();

  const handleClick = () => {
    setCurrentStep(0);
    setIsOpen(true);
    try { localStorage.removeItem("financeiro_tour_seen"); } catch {}
  };

  return (
    <Tooltip title="Iniciar tour guiado" placement={tooltipPlacement}>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: "rgba(148,163,184,0.65)",
          transition: "all 0.2s",
          "&:hover": {
            color: "#a5b4fc",
            bgcolor: "rgba(99,102,241,0.15)",
            transform: "scale(1.1)",
          },
          ...sx,
        }}
      >
        <HelpOutlineRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
