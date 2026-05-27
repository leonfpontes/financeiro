"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";

const NAV = [
  { href: "/",             label: "Foto",     icon: PhotoCameraRoundedIcon },
  { href: "/entradas",    label: "Entradas", icon: TrendingUpRoundedIcon },
  { href: "/gastos",      label: "Gastos",   icon: ReceiptLongRoundedIcon },
  { href: "/compromissos",label: "Planos",   icon: AccountBalanceRoundedIcon },
  { href: "/cartoes",     label: "Cartões",  icon: CreditCardRoundedIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = NAV.findIndex((n) =>
    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
  );

  return (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 2,
        background: "rgba(13, 11, 36, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
        alignItems: "center",
        height: "calc(64px + env(safe-area-inset-bottom))",
      }}
    >
      {NAV.map(({ href, label, icon: Icon }, i) => {
        const active = i === activeIndex;
        return (
          <Box
            key={href}
            onClick={() => router.push(href)}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              cursor: "pointer",
              height: 64,
              position: "relative",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {active && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -60%)",
                  width: 44,
                  height: 30,
                  borderRadius: "10px",
                  bgcolor: "rgba(99,102,241,0.18)",
                  border: "1px solid rgba(129,140,248,0.25)",
                }}
              />
            )}
            <Icon
              sx={{
                fontSize: 22,
                color: active ? "#818cf8" : "rgba(148,163,184,0.55)",
                position: "relative",
                zIndex: 1,
                transition: "color 0.2s",
              }}
            />
            <Typography
              sx={{
                fontSize: "0.58rem",
                fontWeight: active ? 700 : 400,
                color: active ? "#a5b4fc" : "rgba(148,163,184,0.45)",
                letterSpacing: active ? "0.01em" : 0,
                position: "relative",
                zIndex: 1,
                transition: "color 0.2s",
                lineHeight: 1,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

