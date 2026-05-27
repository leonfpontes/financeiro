"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const floatKeyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-3deg); }
    50% { transform: translateY(-14px) rotate(3deg); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const lineItems = [
  { desc: "Página solicitada", qty: "1 un.", value: "—" },
  { desc: "Encontrada no servidor", qty: "0 un.", value: "R$ 0,00" },
  { desc: "Frustração do usuário", qty: "∞", value: "priceless" },
  { desc: "Culpa do desenvolvedor", qty: "100%", value: "assumida" },
  { desc: "Probabilidade de estar com sono", qty: "87%", value: "provável" },
];

export default function NotFoundPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <>
      <style>{floatKeyframes}</style>
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          bgcolor: isDark
            ? "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 100%)"
            : "background.default",
          background: isDark
            ? "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 100%)"
            : "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
        }}
      >
        {/* Floating emoji */}
        <Box
          sx={{
            fontSize: { xs: "3.5rem", sm: "4.5rem" },
            animation: "float 3s ease-in-out infinite",
            mb: 1,
            userSelect: "none",
          }}
        >
          💸
        </Box>

        {/* Giant 404 */}
        <Typography
          component="div"
          sx={{
            fontSize: { xs: "7rem", sm: "10rem", md: "12rem" },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 3s linear infinite",
            mb: 0,
          }}
        >
          404
        </Typography>

        {/* Receipt card */}
        <Paper
          elevation={isDark ? 8 : 3}
          sx={{
            mt: 2,
            maxWidth: 480,
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            animation: "fadeSlideUp 0.6s ease both",
            animationDelay: "0.1s",
            opacity: 0,
            border: isDark
              ? "1px solid rgba(99,102,241,0.25)"
              : "1px solid rgba(99,102,241,0.15)",
          }}
        >
          {/* Receipt header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              px: 3,
              py: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
              }}
            >
              Nota Fiscal Eletrônica
            </Typography>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "white",
                mt: 0.25,
              }}
            >
              Financeiro LTDA — NF nº 000.404
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.65)",
                mt: 0.25,
              }}
            >
              CFOP: 5.404 — Saída sem destino
            </Typography>
          </Box>

          {/* Receipt body */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1, bgcolor: "background.paper" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "text.secondary",
                fontSize: "0.62rem",
              }}
            >
              Descrição do Item
            </Typography>

            <Divider
              sx={{
                my: 1,
                borderStyle: "dashed",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
              }}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {lineItems.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary", fontSize: "0.8rem", flex: 1 }}
                  >
                    {item.desc}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.72rem", minWidth: 40, textAlign: "right" }}
                  >
                    {item.qty}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: item.value === "R$ 0,00" ? "#ef4444" : "text.secondary",
                      fontSize: "0.78rem",
                      minWidth: 72,
                      textAlign: "right",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider
              sx={{
                my: 1.5,
                borderStyle: "dashed",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
              }}
            />

            {/* Total */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }}>
                TOTAL ENCONTRADO
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  fontFamily: "monospace",
                  color: "#ef4444",
                }}
              >
                R$ 0,00
              </Typography>
            </Box>

            {/* Observation box */}
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                border: isDark
                  ? "1px dashed rgba(99,102,241,0.35)"
                  : "1px dashed #c7d2fe",
                bgcolor: isDark ? "rgba(99,102,241,0.08)" : "#eef2ff",
              }}
            >
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#6366f1", fontWeight: 700, mb: 0.25, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                Observações do Emitente
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                A rota solicitada não consta em nenhuma categoria do orçamento deste
                sistema. Verifique o endereço digitado ou retorne ao item principal.
                Este documento não tem valor fiscal.
              </Typography>
            </Box>

            {/* Tear line */}
            <Box
              sx={{
                mt: 2.5,
                mx: -3,
                height: "1px",
                background: isDark
                  ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 8px, transparent 8px 16px)"
                  : "repeating-linear-gradient(90deg, #cbd5e1 0 8px, transparent 8px 16px)",
              }}
            />

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                pt: 2,
                pb: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                startIcon={<HomeRoundedIcon />}
                onClick={() => router.push("/")}
                sx={{
                  flex: 1,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
                  },
                }}
              >
                Início
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => router.back()}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                  borderColor: isDark ? "rgba(99,102,241,0.4)" : "#c7d2fe",
                  color: "#6366f1",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(99,102,241,0.08)" : "#eef2ff",
                    borderColor: "#6366f1",
                  },
                }}
              >
                Voltar
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{ mt: 3, color: "text.secondary", opacity: 0.5, textAlign: "center" }}
        >
          Erro 404 — Item não encontrado no orçamento
        </Typography>
      </Box>
    </>
  );
}
