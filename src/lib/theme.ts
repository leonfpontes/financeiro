"use client";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5", contrastText: "#fff" },
    success:  { main: "#10b981", light: "#34d399", dark: "#059669", contrastText: "#fff" },
    error:    { main: "#f43f5e", light: "#fb7185", dark: "#e11d48", contrastText: "#fff" },
    warning:  { main: "#f59e0b", contrastText: "#fff" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "#f1f5f9",
  },
  typography: {
    fontFamily: 'var(--font-sans), "Plus Jakarta Sans", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
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
