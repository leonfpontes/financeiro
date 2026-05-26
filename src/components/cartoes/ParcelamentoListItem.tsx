"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { formatBRL } from "@/lib/utils/currency";

interface Props {
  nome: string;
  parcelaAtual: number;
  totalParcelas: number;
  valorParcela: number;
  valorTotal?: number;
  mesInicio?: string;
  mesFim: string;
  notas?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

function formatMes(mesAno: string): string {
  const [y, m] = mesAno.split("-");
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[Number(m) - 1]}/${y.slice(2)}`;
}

export function ParcelamentoListItem({ nome, parcelaAtual, totalParcelas, valorParcela, valorTotal, mesInicio, mesFim, notas, onEdit, onDelete }: Props) {
  const pct = totalParcelas > 0 ? (parcelaAtual / totalParcelas) * 100 : 0;
  const restante = valorTotal != null ? valorTotal - (parcelaAtual - 1) * valorParcela : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{nome}</Typography>
          <Typography variant="caption" color="text.secondary">
            Parcela {parcelaAtual} de {totalParcelas}{mesInicio ? ` · ${formatMes(mesInicio)} → ` : " · até "}{formatMes(mesFim)}
          </Typography>
          {notas && (
            <Typography variant="caption" sx={{ display: "block", color: "text.disabled", fontStyle: "italic", mt: 0.25 }}>{notas}</Typography>
          )}
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }} color="primary.light">{formatBRL(valorParcela)}<Typography component="span" variant="caption" color="text.secondary">/parc.</Typography></Typography>
          {restante != null && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Restante: {formatBRL(restante)}</Typography>
          )}
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end", mt: 0.3 }}>
            <Box onClick={onEdit} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "rgba(148,163,184,0.8)", "&:hover": { background: "rgba(255,255,255,0.08)" } }}>Editar</Box>
            <Box onClick={onDelete} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "#ef4444", "&:hover": { background: "rgba(239,68,68,0.1)" } }}>Excluir</Box>
          </Box>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": { bgcolor: "#818cf8", borderRadius: 2 },
        }}
      />
    </Box>
  );
}
