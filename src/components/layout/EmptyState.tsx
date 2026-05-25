import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 7, px: 2, textAlign: "center" }}>
      {icon && <Box sx={{ fontSize: 48, mb: 2, lineHeight: 1 }}>{icon}</Box>}
      <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600, mb: description ? 0.5 : action ? 2 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2.5 : 0, maxWidth: 280 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
