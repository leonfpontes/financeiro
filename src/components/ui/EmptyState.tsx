"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SvgIconComponent } from "@mui/icons-material";

interface EmptyStateProps {
  Icon: SvgIconComponent;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ Icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        gap: 2,
      }}
    >
      <Icon sx={{ fontSize: 56, color: "text.disabled" }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
