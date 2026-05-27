"use client";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "@/lib/theme";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>{children}</div>
      </div>
    </ThemeProvider>
  );
}
