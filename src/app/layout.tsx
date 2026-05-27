import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { MuiProvider } from "@/components/providers/MuiProvider";
import { ThemeModeProvider } from "@/components/providers/ThemeContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Financeiro — Controle Financeiro Familiar",
  description: "Gerencie as finanças da sua família com facilidade",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: a classe `dark` é aplicada via JS após hidratação
    <html lang="pt-BR" className={jakarta.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeModeProvider>
          <AppRouterCacheProvider>
            <MuiProvider>{children}</MuiProvider>
          </AppRouterCacheProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
