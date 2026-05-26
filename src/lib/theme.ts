"use client";
import { createTheme } from "@mui/material/styles";

// ─── Shared typography + shape ────────────────────────────────────────────────
const sharedTypography = {
  fontFamily: 'var(--font-sans), "Plus Jakarta Sans", sans-serif',
  h1: { fontWeight: 800 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: "none" as const },
};

// ─── Light theme ──────────────────────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5", contrastText: "#fff" },
    success:  { main: "#10b981", light: "#34d399", dark: "#059669", contrastText: "#fff" },
    error:    { main: "#f43f5e", light: "#fb7185", dark: "#e11d48", contrastText: "#fff" },
    warning:  { main: "#f59e0b", contrastText: "#fff" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "#f1f5f9",
  },
  typography: sharedTypography,
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.875rem",
          fontWeight: 600,
          "&.MuiButton-containedPrimary": {
            boxShadow: "0 4px 14px 0 rgba(99,102,241,0.35)",
            "&:hover": { boxShadow: "0 6px 20px 0 rgba(99,102,241,0.4)" },
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { "&:last-child": { paddingBottom: 16 } } },
    },
    MuiTextField: {
      defaultProps: { size: "small", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "& fieldset": { borderColor: "#e2e8f0" },
            "&:hover fieldset": { borderColor: "#cbd5e1" },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: "1.1rem", fontWeight: 700, paddingBottom: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          height: 8,
          backgroundColor: "#f1f5f9",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#64748b",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
        },
        body: {
          borderBottom: "1px solid #f8fafc",
          fontSize: "0.875rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#fafbfc" },
          "&:last-child td": { borderBottom: "none" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontSize: "0.72rem", fontWeight: 600, height: 22 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiSkeleton: {
      defaultProps: { animation: "wave" },
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: "#f1f5f9" },
      },
    },
  },
});

// ─── Dark theme ───────────────────────────────────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8", light: "#a5b4fc", dark: "#6366f1", contrastText: "#fff" },
    success:  { main: "#34d399", light: "#6ee7b7", dark: "#10b981", contrastText: "#0f172a" },
    error:    { main: "#fb7185", light: "#fda4af", dark: "#f43f5e", contrastText: "#0f172a" },
    warning:  { main: "#fbbf24", contrastText: "#0f172a" },
    background: { default: "#0d0d1f", paper: "#161628" },
    text: { primary: "#f1f5f9", secondary: "#94a3b8" },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: sharedTypography,
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.875rem",
          fontWeight: 600,
          "&.MuiButton-containedPrimary": {
            boxShadow: "0 4px 14px 0 rgba(129,140,248,0.4)",
            "&:hover": { boxShadow: "0 6px 22px 0 rgba(129,140,248,0.6)" },
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(129,140,248,0.15)",
          boxShadow: "0 0 0 1px rgba(129,140,248,0.08), 0 4px 24px rgba(13,13,31,0.6)",
          backgroundImage: "none",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { "&:last-child": { paddingBottom: 16 } } },
    },
    MuiTextField: {
      defaultProps: { size: "small", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "& fieldset": { borderColor: "rgba(129,140,248,0.2)" },
            "&:hover fieldset": { borderColor: "rgba(129,140,248,0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#818cf8", boxShadow: "0 0 0 3px rgba(129,140,248,0.15)" },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0 25px 60px rgba(13,13,31,0.8), 0 0 0 1px rgba(129,140,248,0.15)",
          backgroundImage: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: "1.1rem", fontWeight: 700, paddingBottom: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          height: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
        },
        bar: {
          boxShadow: "0 0 8px rgba(129,140,248,0.5)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#94a3b8",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          backgroundColor: "#0d0d1f",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        },
        body: {
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          fontSize: "0.875rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "rgba(129,140,248,0.05)" },
          "&:last-child td": { borderBottom: "none" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontSize: "0.72rem", fontWeight: 600, height: 22 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiSkeleton: {
      defaultProps: { animation: "wave" },
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)" },
      },
    },
  },
});

// Mantém compatibilidade com imports antigos
export const theme = lightTheme;

