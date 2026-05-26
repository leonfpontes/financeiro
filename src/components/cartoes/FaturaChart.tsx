"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatBRL } from "@/lib/utils/currency";

interface Ponto {
  mesAno: string;
  total?: number;
  projecao?: number;
  atual?: number;
}

interface Props {
  historico: Array<{ mesAno: string; total: number }>;
  mesAtual: { mesAno: string; total: number };
  forecast: Array<{ mesAno: string; valor: number }>;
  insufficient: boolean;
}

function formatMes(mesAno: string): string {
  const [y, m] = mesAno.split("-");
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[Number(m) - 1]}/${y.slice(2)}`;
}

const SERIE_LABEL: Record<string, string> = {
  total:    "Histórico",
  atual:    "Mês atual",
  projecao: "Previsão",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", px: 1.75, py: 1.25, backdropFilter: "blur(8px)" }}>
      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", mb: 0.75, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label ? formatMes(label) : ""}
      </Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", minWidth: 80 }}>{SERIE_LABEL[p.dataKey] ?? p.dataKey}</Typography>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{formatBRL(p.value)}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function FaturaChart({ historico, mesAtual, forecast, insufficient }: Props) {
  if (insufficient) {
    return (
      <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
        <Typography variant="body2">Adicione lançamentos por pelo menos 2 meses para ver a previsão.</Typography>
      </Box>
    );
  }

  const data: Ponto[] = [
    ...historico.map((p) => ({ mesAno: p.mesAno, total: p.total })),
    { mesAno: mesAtual.mesAno, atual: mesAtual.total },
    ...forecast.map((p) => ({ mesAno: p.mesAno, projecao: p.valor })),
  ];

  return (
    <Box sx={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="mesAno" tickFormatter={formatMes} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tickFormatter={(v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : v > 0 ? `R$${Math.round(v)}` : "R$0"} tick={{ fill: "#94a3b8", fontSize: 11 }} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={mesAtual.mesAno} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Line dataKey="total" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: "#818cf8" }} connectNulls name="Histórico" />
          <Line dataKey="atual" stroke="#818cf8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 5, fill: "#818cf8", strokeWidth: 2, stroke: "#fff" }} connectNulls name="Mês atual" />
          <Line dataKey="projecao" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#f59e0b" }} connectNulls name="Previsão" />
        </LineChart>
      </ResponsiveContainer>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 0.5 }}>
        {[{ color: "#818cf8", label: "Histórico" }, { color: "#818cf8", label: "Mês atual (em andamento)", dashed: true }, { color: "#f59e0b", label: "Previsão", dashed: true }].map(({ color, label, dashed }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 20, height: 2, bgcolor: color, opacity: dashed ? 0.6 : 1, borderRadius: 1, borderTop: dashed ? `2px dashed ${color}` : "none", background: "none", borderBottom: "none" }} />
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
