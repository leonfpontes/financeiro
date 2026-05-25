"use client";

import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { usePathname, useRouter } from "next/navigation";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";

const NAV = [
  { href: "/", label: "Fotografia", icon: PhotoCameraRoundedIcon },
  { href: "/entradas", label: "Entradas", icon: TrendingUpRoundedIcon },
  { href: "/gastos", label: "Gastos", icon: ReceiptLongRoundedIcon },
  { href: "/compromissos", label: "Compromissos", icon: AccountBalanceRoundedIcon },
  { href: "/evolucao", label: "Evolução", icon: ShowChartRoundedIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const value = NAV.findIndex((n) => n.href === pathname);

  return (
    <Paper
      elevation={8}
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <BottomNavigation
        value={value === -1 ? 0 : value}
        onChange={(_, newValue) => router.push(NAV[newValue].href)}
        sx={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #0f0c29 100%)",
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            color: "rgba(148,163,184,0.7)",
            minWidth: 0,
            padding: "6px 0",
            "&.Mui-selected": {
              color: "#818cf8",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.6rem !important",
            marginTop: "2px",
            "&.Mui-selected": {
              fontSize: "0.6rem !important",
            },
          },
        }}
      >
        {NAV.map(({ label, icon: Icon }) => (
          <BottomNavigationAction key={label} label={label} icon={<Icon sx={{ fontSize: 22 }} />} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
