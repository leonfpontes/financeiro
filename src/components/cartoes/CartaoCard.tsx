"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import { formatBRL } from "@/lib/utils/currency";

interface Props {
  cartao: {
    id: string;
    nome: string;
    limite: number;
    cor: string | null;
    ativo: boolean;
    diaVencimento: number;
    faturaMesAtual: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

function vencimentoChip(dia: number): { label: string; color: string; bg: string } {
  const hoje = new Date().getDate();
  const diff = dia - hoje;
  if (diff < 0) return { label: `Venceu dia ${dia}`, color: "#94a3b8", bg: "rgba(148,163,184,0.15)" };
  if (diff <= 3) return { label: `Vence dia ${dia}`, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  return { label: `Vence dia ${dia}`, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
}

export function CartaoCard({ cartao, onEdit, onDelete, onClick }: Props) {
  const cor = cartao.cor ?? "#6366f1";
  const pct = cartao.limite > 0 ? Math.min((cartao.faturaMesAtual / cartao.limite) * 100, 100) : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";
  const chip = vencimentoChip(cartao.diaVencimento);

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #1e1e3a 0%, #16213e 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        opacity: cartao.ativo ? 1 : 0.5,
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 32px rgba(0,0,0,0.4)` },
      }}
    >
      {/* Colored top bar */}
      <Box sx={{ height: 6, background: cor }} />

      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: "10px", background: `${cor}33`, display: "flex" }}>
            <CreditCardRoundedIcon sx={{ color: cor, fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9" }} noWrap>{cartao.nome}</Typography>
              {!cartao.ativo && (
                <Typography sx={{ fontSize: "0.65rem", px: 0.75, py: 0.2, borderRadius: "4px", bgcolor: "rgba(100,116,139,0.2)", color: "#94a3b8", fontWeight: 600 }}>INATIVO</Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: "0.7rem", px: 0.75, py: 0.2, borderRadius: "4px", bgcolor: chip.bg, color: chip.color, fontWeight: 600, display: "inline-block", mt: 0.25 }}>{chip.label}</Typography>
          </Box>
          <Box
            onClick={(e) => { e.stopPropagation(); }}
            sx={{ display: "flex", gap: 0.5 }}
          >
            <Box
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              sx={{ fontSize: "0.7rem", px: 1, py: 0.4, borderRadius: "6px", cursor: "pointer", color: "rgba(148,163,184,0.8)", "&:hover": { background: "rgba(255,255,255,0.08)" } }}
            >
              Editar
            </Box>
            <Box
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              sx={{ fontSize: "0.7rem", px: 1, py: 0.4, borderRadius: "6px", cursor: "pointer", color: "#ef4444", "&:hover": { background: "rgba(239,68,68,0.1)" } }}
            >
              Excluir
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", mb: 0.2 }}>Fatura do mês</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: barColor, mb: 0.5 }}>
          {formatBRL(cartao.faturaMesAtual)}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{pct.toFixed(0)}% do limite</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{formatBRL(cartao.limite)}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.08)",
            "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 3 },
          }}
        />
      </Box>
    </Box>
  );
}
