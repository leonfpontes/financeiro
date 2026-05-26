"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Mode = "light" | "dark";

interface ThemeModeCtx {
  mode: Mode;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeCtx>({ mode: "light", toggle: () => {} });

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");

  // Lê preferência salva ou preferência do sistema operacional
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Mode | null;
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode("dark");
    }
  }, []);

  // Aplica/remove classe `dark` no <html> e persiste preferência
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
