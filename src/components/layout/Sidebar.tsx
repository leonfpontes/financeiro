"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Logo } from "./Logo";

const DRAWER_WIDTH = 260;

const nav = [
  { href: "/",             label: "Fotografia",   icon: PhotoCameraRoundedIcon },
  { href: "/entradas",    label: "Entradas",      icon: TrendingUpRoundedIcon },
  { href: "/gastos",      label: "Gastos",        icon: ReceiptLongRoundedIcon },
  { href: "/compromissos", label: "Compromissos", icon: AccountBalanceRoundedIcon },
  { href: "/evolucao",    label: "Evolução",      icon: ShowChartRoundedIcon },
  { href: "/cartoes",     label: "Cartões",       icon: CreditCardRoundedIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Usu\u00e1rio";
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: "none", md: "block" },
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          border: "none",
          background: "linear-gradient(180deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
          color: "#e2e8f0",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2.5, pt: 3, pb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ flexShrink: 0, filter: "drop-shadow(0 4px 12px rgba(99,102,241,0.45))" }}>
          <Logo size={36} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "white", letterSpacing: "-0.02em" }}>
          Financeiro
        </Typography>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1.5, flex: 1 }} disablePadding>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                color: active ? "white" : "rgba(148,163,184,1)",
                bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
                borderLeft: active ? "3px solid #818cf8" : "3px solid transparent",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
                transition: "all 0.15s",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { style: { fontSize: "0.875rem", fontWeight: active ? 600 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, mb: 0.5 }}>
          <Avatar
            sx={{
              width: 30, height: 30, fontSize: "0.75rem", fontWeight: 700,
              bgcolor: "rgba(99,102,241,0.35)", color: "#a5b4fc",
            }}
          >
            {initials}
          </Avatar>
          <Typography variant="caption" color="rgba(148,163,184,1)" noWrap>
            {name}
          </Typography>
        </Box>
        <ListItemButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            borderRadius: 2, px: 1.5, py: 1,
            color: "rgba(148,163,184,1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "white" },
            transition: "all 0.15s",
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sair" slotProps={{ primary: { style: { fontSize: "0.875rem", fontWeight: 500 } } }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

