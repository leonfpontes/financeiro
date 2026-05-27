"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";

const keyframes = `
  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(-8deg) scale(1.05); }
    30% { transform: rotate(8deg) scale(1.08); }
    45% { transform: rotate(-6deg) scale(1.04); }
    60% { transform: rotate(6deg) scale(1.06); }
    75% { transform: rotate(-3deg); }
    90% { transform: rotate(3deg); }
  }
  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0.12); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ticker {
    from { transform: translateX(100%); }
    to   { transform: translateX(-100%); }
  }
`;

const funnyMessages = [
  "O servidor tentou fazer uma compra por impulso e travou.",
  "Alguém esqueceu de reservar dinheiro para o servidor de produção.",
  "Este erro foi gerado com sustentabilidade: 100% orgânico, sem culpa.",
  "O código entrou em modo pânico financeiro.",
  "Uma exception não planejada chegou como gasto imprevisto no mês.",
];

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const message =
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  useEffect(() => {
    console.error("[ErrorPage]", error);
  }, [error]);

  return (
    <>
      <style>{keyframes}</style>
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          background: isDark
            ? "linear-gradient(135deg, #1a0a0a 0%, #2a0f0f 100%)"
            : "linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%)",
        }}
      >
        {/* Ticker tape */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bgcolor: "#ef4444",
            overflow: "hidden",
            py: 0.75,
          }}
        >
          <Typography
            sx={{
              display: "inline-block",
              animation: "ticker 18s linear infinite",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "white",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            🚨 ALERTA DE CRISE SISTÊMICA &nbsp;•&nbsp; SALDO DE ESTABILIDADE: R$&nbsp;0,00
            &nbsp;•&nbsp; ÍNDICE DE CONFIANÇA: NEGATIVO &nbsp;•&nbsp; RECOMENDAÇÃO: REINICIAR
            &nbsp;•&nbsp; CULPA DO DESENVOLVEDOR: 100% &nbsp;•&nbsp; 🚨 ALERTA DE CRISE SISTÊMICA
            &nbsp;•&nbsp; SALDO DE ESTABILIDADE: R$&nbsp;0,00 &nbsp;•&nbsp; ÍNDICE DE CONFIANÇA: NEGATIVO
          </Typography>
        </Box>

        {/* Main icon */}
        <Box
          sx={{
            fontSize: { xs: "4rem", sm: "5.5rem" },
            animation: "shake 2.5s ease-in-out infinite",
            mt: 5,
            mb: 0.5,
            userSelect: "none",
          }}
        >
          🐷
        </Box>
        <Typography
          sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 1, fontStyle: "italic" }}
        >
          (cofre quebrado)
        </Typography>

        {/* Big status */}
        <Typography
          component="div"
          sx={{
            fontSize: { xs: "5rem", sm: "7rem", md: "9rem" },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: "#ef4444",
            textShadow: isDark
              ? "0 0 40px rgba(239,68,68,0.4)"
              : "0 4px 20px rgba(239,68,68,0.25)",
            animation: "pulse-red 2s ease-in-out infinite",
            display: "inline-block",
            borderRadius: 2,
          }}
        >
          500
        </Typography>

        {/* Bank statement card */}
        <Paper
          elevation={isDark ? 8 : 4}
          sx={{
            mt: 2,
            maxWidth: 500,
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            animation: "fadeSlideUp 0.6s ease both",
            animationDelay: "0.15s",
            opacity: 0,
            border: isDark
              ? "1px solid rgba(239,68,68,0.25)"
              : "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {/* Statement header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                }}
              >
                Extrato de Emergência
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "white" }}>
                Financeiro — Conta Corrente
              </Typography>
            </Box>
            <Chip
              label="SISTEMA EM COLAPSO"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.62rem",
                letterSpacing: "0.04em",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            />
          </Box>

          {/* Statement body */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1, bgcolor: "background.paper" }}>
            {/* KPIs */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1.5,
                mb: 2,
              }}
            >
              {[
                { label: "Saldo de estabilidade", value: "R$ 0,00", bad: true },
                { label: "Uptime hoje", value: "Comprometido", bad: true },
                { label: "Culpa do café", value: "43%", bad: false },
              ].map((kpi) => (
                <Box
                  key={kpi.label}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: isDark
                      ? kpi.bad ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.08)"
                      : kpi.bad ? "#fef2f2" : "#eef2ff",
                    border: `1px solid ${isDark
                      ? kpi.bad ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.15)"
                      : kpi.bad ? "#fecaca" : "#c7d2fe"
                    }`,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 0.25,
                    }}
                  >
                    {kpi.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontFamily: "monospace",
                      fontSize: "0.82rem",
                      color: kpi.bad ? "#ef4444" : "#6366f1",
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider
              sx={{
                borderStyle: "dashed",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                mb: 2,
              }}
            />

            {/* Funny message */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(245,158,11,0.08)" : "#fffbeb",
                border: `1px solid ${isDark ? "rgba(245,158,11,0.2)" : "#fde68a"}`,
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "#f59e0b",
                  fontWeight: 700,
                  mb: 0.25,
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                📋 Laudo técnico
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6, fontStyle: "italic" }}>
                "{message}"
              </Typography>
            </Box>

            {/* Error details */}
            {error.message && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(15,15,15,0.6)" : "#f8fafc",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                  <BugReportRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.62rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Detalhes do sinistro
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    color: "#ef4444",
                    fontSize: "0.72rem",
                    wordBreak: "break-all",
                    display: "block",
                  }}
                >
                  {error.message}
                </Typography>
                {error.digest && (
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace", color: "text.secondary", fontSize: "0.65rem" }}
                  >
                    digest: {error.digest}
                  </Typography>
                )}
              </Box>
            )}

            {/* Tear line */}
            <Box
              sx={{
                mx: -3,
                height: "1px",
                background: isDark
                  ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0 8px, transparent 8px 16px)"
                  : "repeating-linear-gradient(90deg, #cbd5e1 0 8px, transparent 8px 16px)",
              }}
            />

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1.5, pt: 2, pb: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<RefreshRoundedIcon />}
                onClick={reset}
                sx={{
                  flex: 1,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 6px 18px rgba(239,68,68,0.45)",
                  },
                }}
              >
                Tentar novamente
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeRoundedIcon />}
                onClick={() => router.push("/")}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                  borderColor: isDark ? "rgba(239,68,68,0.35)" : "#fecaca",
                  color: "#ef4444",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(239,68,68,0.08)" : "#fef2f2",
                    borderColor: "#ef4444",
                  },
                }}
              >
                Início
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{ mt: 3, color: "text.secondary", opacity: 0.45, textAlign: "center" }}
        >
          Erro 500 — Colapso financeiro sistêmico detectado
        </Typography>
      </Box>
    </>
  );
}
