"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { TourButton } from "@/components/tour/TourButton";

const PAGE_TITLES: Record<string, string> = {
  "/": "Fotografia",
  "/entradas": "Entradas",
  "/gastos": "Gastos",
  "/compromissos": "Compromissos",
  "/evolucao": "Evolução",
  "/cartoes": "Cartões",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/cartoes/")) return "Detalhe do Cartão";
  return "Financeiro";
}

export function TopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = (session?.user as { name?: string })?.name ?? "Usuário";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const title = getTitle(pathname);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        display: { xs: "flex", md: "none" },
        background: "linear-gradient(90deg, #0f0c29 0%, #1a1a2e 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            ₢
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "white", letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TourButton tooltipPlacement="bottom" sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#a5b4fc", bgcolor: "rgba(99,102,241,0.2)" } }} />
          <ThemeToggle />
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: "0.7rem",
              fontWeight: 700,
              bgcolor: "rgba(99,102,241,0.4)",
              color: "#a5b4fc",
              cursor: "pointer",
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {initials}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          slotProps={{ paper: { sx: { minWidth: 160, mt: 0.5 } } }}
        >
          <MenuItem dense disabled sx={{ opacity: "1 !important" }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {name}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              signOut({ callbackUrl: "/login" });
            }}
          >
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
