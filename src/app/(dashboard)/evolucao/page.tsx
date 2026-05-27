"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import Link from "next/link";
import Button from "@mui/material/Button";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatBRL } from "@/lib/utils/currency";
import { InsightCard } from "@/components/ui/InsightCard";
import { analyzeEvolucao } from "@/lib/insights/rules/evolucao";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RealizadoMes {
  entradas:        number | null;
  gastosFixos:     number | null;
  gastosVariaveis: number | null;
  gastosSazonais:  number | null;
  compromissos:    number | null;
}

interface MesData {
  mesAno:              string;
  hasSnapshot:         boolean;
  entradas:            number;
  compromissos:        number;
  gastosFixos:         number;
  gastosVariaveis:     number;
  gastosSazonais:      number;
  gastosCartoes:       number;
  margem:              number;
  margemPercent:       number;
  totalGastos:         number;
  totalSaidas:         number;
  disponivel:          number;
  comprometidoPercent: number;
  realizado:           RealizadoMes | null;
}

type Periodo = "3" | "6" | "12" | "24";
type Modo = "planejado" | "realizado";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function labelMes(mesAno: string): string {
  const [y, m] = mesAno.split("-").map(Number);
  return `${MESES_ABREV[m - 1]}/${String(y).slice(2)}`;
}

function fmtBRL(v: number): string { return formatBRL(v); }
function fmtK(v: number): string {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return `R$${v.toFixed(0)}`;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function tendency(series: MesData[], key: keyof MesData): { pct: number; dir: "up" | "down" | "flat" } {
  if (series.length < 2) return { pct: 0, dir: "flat" };
  const first = series[0][key] as number;
  const last  = series[series.length - 1][key] as number;
  if (first === 0) return { pct: 0, dir: "flat" };
  const pct = ((last - first) / Math.abs(first)) * 100;
  return { pct: Math.abs(pct), dir: pct > 1 ? "up" : pct < -1 ? "down" : "flat" };
}

// ─── Tooltip components ──────────────────────────────────────────────────────

function FluxoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entradas  = payload.find((p: any) => p.dataKey === "entradas")?.value ?? 0;
  const saidas    = payload.find((p: any) => p.dataKey === "totalSaidas")?.value ?? 0;
  const resultado = entradas - saidas;
  return (
    <Box sx={{ bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2, p: 1.5, minWidth: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1 }}>{label}</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Entradas</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>{fmtBRL(entradas)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Saídas</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#f43f5e", fontFamily: "monospace" }}>{fmtBRL(saidas)}</Typography>
        </Box>
        <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 0.5, mt: 0.25, display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>Resultado</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: resultado >= 0 ? "#10b981" : "#f43f5e", fontFamily: "monospace" }}>
            {resultado >= 0 ? "+" : ""}{fmtBRL(resultado)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ComposicaoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p: any) => p.dataKey !== "entradas" && p.value > 0);
  const entradas = payload.find((p: any) => p.dataKey === "entradas")?.value ?? 0;
  return (
    <Box sx={{ bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2, p: 1.5, minWidth: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1 }}>{label}</Typography>
      {items.map((p: any) => (
        <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 3, mb: 0.4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.fill, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "#64748b" }}>{p.name}</Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b", fontFamily: "monospace" }}>{fmtBRL(p.value)}</Typography>
        </Box>
      ))}
      {entradas > 0 && (
        <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 0.5, mt: 0.5, display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Entradas</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>{fmtBRL(entradas)}</Typography>
        </Box>
      )}
    </Box>
  );
}

function CompromissoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const over = val > 85;
  return (
    <Box sx={{ bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2, p: 1.5, minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.75 }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: "monospace", color: over ? "#f43f5e" : "#10b981", fontSize: "1rem" }}>
        {val.toFixed(1)}%
      </Typography>
      <Typography variant="caption" sx={{ display: "block", color: "#64748b", mt: 0.25 }}>
        {over ? "Acima da meta de 85%" : "Dentro da meta"}
      </Typography>
    </Box>
  );
}

function RealTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const plan = payload.find((p: any) => p.dataKey === "planejado")?.value ?? 0;
  const real = payload.find((p: any) => p.dataKey === "realizado")?.value ?? 0;
  const diff = real - plan;
  return (
    <Box sx={{ bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2, p: 1.5, minWidth: 190, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1 }}>{label}</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Planejado</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#6366f1", fontFamily: "monospace" }}>{fmtBRL(plan)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Realizado</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#0ea5e9", fontFamily: "monospace" }}>{fmtBRL(real)}</Typography>
        </Box>
        {real > 0 && (
          <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 0.5, mt: 0.25, display: "flex", justifyContent: "space-between", gap: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Diferença</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: diff > 0 ? "#f43f5e" : "#10b981", fontFamily: "monospace" }}>
              {diff > 0 ? "+" : ""}{fmtBRL(diff)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, info }: { title: string; subtitle?: string; info?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {info && (
        <Tooltip title={info} placement="left">
          <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mt: 0.25, cursor: "help" }} />
        </Tooltip>
      )}
    </Box>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, color, bg, sub, subColor,
}: {
  label: string; value: string; icon: React.ReactNode;
  color: string; bg: string; sub?: string; subColor?: string;
}) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, flexShrink: 0, minWidth: 150 }}>
      <CardContent sx={{ p: "16px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Box sx={{ color, display: "flex" }}>{icon}</Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{label}</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "monospace", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: subColor ?? "text.disabled", display: "block", mt: 0.5, fontWeight: 600 }}>{sub}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EvolucaoPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [series, setSeries] = useState<MesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("6");
  const [modo, setModo] = useState<Modo>("planejado");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/evolucao?meses=${periodo}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { setSeries(res.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [periodo]);

  useEffect(() => {
    const saved = localStorage.getItem("evolucao_periodo") as Periodo | null;
    if (saved && ["3","6","12","24"].includes(saved)) setPeriodo(saved);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePeriodo = (_: React.MouseEvent, val: Periodo | null) => {
    if (!val) return;
    setPeriodo(val);
    localStorage.setItem("evolucao_periodo", val);
  };

  const handleLimparHistorico = async () => {
    const snapshotMeses = series.filter((s) => s.hasSnapshot).map((s) => s.mesAno);
    if (!snapshotMeses.length) return;
    const ok = window.confirm(
      `Isso vai remover o histórico de ${snapshotMeses.length} mês(es) (${snapshotMeses.map((m) => { const [y,mo] = m.split("-"); return `${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][Number(mo)-1]}/${String(y).slice(2)}`; }).join(", ")}).\n\nOs dados desses meses não serão mais exibidos na Evolução. Continuar?`
    );
    if (!ok) return;
    setClearing(true);
    await fetch("/api/evolucao/snapshots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAnos: snapshotMeses }),
    });
    setClearing(false);
    load();
  };

  // ── Derived data ────────────────────────────────────────────────────────

  const hasRealizado = series.some((s) => s.realizado !== null);

  const chartData = series.map((s) => {
    const totalSaidasReal = s.realizado
      ? (s.realizado.gastosFixos     ?? 0) +
        (s.realizado.gastosVariaveis ?? 0) +
        (s.realizado.gastosSazonais  ?? 0) +
        (s.realizado.compromissos    ?? 0)
      : null;

    return {
      name:           labelMes(s.mesAno),
      entradas:       modo === "realizado" && s.realizado?.entradas != null ? s.realizado.entradas : s.entradas,
      totalSaidas:    modo === "realizado" && totalSaidasReal != null ? totalSaidasReal : s.totalSaidas,
      margem:         s.disponivel,
      gastosFixos:    s.gastosFixos,
      gastosVariaveis: s.gastosVariaveis,
      gastosSazonais:  s.gastosSazonais,
      gastosCartoes:   s.gastosCartoes,
      compromissos:   s.compromissos,
      comprometido:   parseFloat(s.comprometidoPercent.toFixed(1)),
      // planejado vs realizado (total saídas)
      planejado:      s.totalSaidas,
      realizado:      totalSaidasReal,
    };
  });

  // KPI calculations
  const avgEntradas     = avg(series.map((s) => s.entradas));
  const avgGastos       = avg(series.map((s) => s.totalGastos));
  const avgMargem       = avg(series.map((s) => s.disponivel));
  const tendMargem      = tendency(series, "disponivel");
  const tendCompr       = tendency(series, "comprometidoPercent");

  const TrendIconMargem = tendMargem.dir === "up" ? TrendingUpRoundedIcon
    : tendMargem.dir === "down" ? TrendingDownRoundedIcon
    : TrendingFlatRoundedIcon;
  const trendColorMargem = tendMargem.dir === "up" ? "#10b981" : tendMargem.dir === "down" ? "#f43f5e" : "#94a3b8";

  const hasData = series.length > 0 && series.some((s) => s.entradas > 0);
  const snapshotCount = series.filter((s) => s.hasSnapshot).length;

  const insights = useMemo(() => analyzeEvolucao(series), [series]);

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (loading) return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 3 }} />
      <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
        {[1,2,3,4].map((i) => <Skeleton key={i} variant="rectangular" height={90} sx={{ borderRadius: 3, flex: "1 0 160px" }} />)}
      </Box>
      {[300,280,260].map((h, i) => <Skeleton key={i} variant="rectangular" height={h} sx={{ borderRadius: 3 }} />)}
    </Box>
  );

  // ── Empty state ─────────────────────────────────────────────────────────

  if (!hasData) return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Evolução Financeira</Typography>
      <Card elevation={0} sx={{ border: "2px dashed #c7d2fe", background: "#fafafe", borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <ShowChartRoundedIcon sx={{ fontSize: 48, color: "#a5b4fc", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#4f46e5" }}>
            Nenhum dado para exibir ainda
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure sua fotografia financeira para começar a acompanhar a evolução do seu orçamento mês a mês.
          </Typography>
          <Button component={Link} href="/" variant="contained" sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}>
            Ir para Fotografia
          </Button>
        </CardContent>
      </Card>
    </Box>
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Cabeçalho + filtros ── */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Evolução Financeira
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fluxo de caixa mês a mês
          </Typography>
        </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          {snapshotCount > 0 && (
            <Tooltip title={`Remover histórico de ${snapshotCount} mês(es) registrados antes de agora`}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleLimparHistorico}
                  disabled={clearing}
                  sx={{ fontSize: "0.72rem", textTransform: "none", fontWeight: 600, borderRadius: 2, py: 0.5 }}
                >
                  {clearing ? "Limpando..." : `Limpar histórico (${snapshotCount})`}
                </Button>
              </span>
            </Tooltip>
          )}
          {hasRealizado && (
            <ToggleButtonGroup value={modo} exclusive onChange={(_,v) => v && setModo(v)} size="small">
              <ToggleButton value="planejado" sx={{ px: 1.75, fontSize: "0.75rem", textTransform: "none", fontWeight: 600 }}>Planejado</ToggleButton>
              <ToggleButton value="realizado" sx={{ px: 1.75, fontSize: "0.75rem", textTransform: "none", fontWeight: 600 }}>Realizado</ToggleButton>
            </ToggleButtonGroup>
          )}
          <ToggleButtonGroup value={periodo} exclusive onChange={handlePeriodo} size="small">
            {(["3","6","12","24"] as Periodo[]).map((p) => (
              <ToggleButton key={p} value={p} sx={{ px: 1.5, fontSize: "0.75rem", textTransform: "none", fontWeight: 600 }}>
                {p}M
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── KPI Row ── */}
      <InsightCard insights={insights} />

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 0.5 }}>
        <KpiCard
          label="Média de Entradas"
          value={fmtBRL(avgEntradas)}
          icon={<TrendingUpRoundedIcon sx={{ fontSize: 18 }} />}
          color="#10b981" bg="#dcfce7"
        />
        <KpiCard
          label="Média de Gastos"
          value={fmtBRL(avgGastos)}
          icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 18 }} />}
          color="#f43f5e" bg="#ffe4e6"
        />
        <KpiCard
          label="Média Disponível"
          value={fmtBRL(avgMargem)}
          icon={<SavingsRoundedIcon sx={{ fontSize: 18 }} />}
          color="#6366f1" bg="#e0e7ff"
          sub={`${tendMargem.pct.toFixed(1)}% ${tendMargem.dir === "up" ? "↑" : tendMargem.dir === "down" ? "↓" : "→"}`}
          subColor={trendColorMargem}
        />
        <KpiCard
          label="Comprometimento médio"
          value={`${avg(series.map((s) => s.comprometidoPercent)).toFixed(1)}%`}
          icon={<PercentRoundedIcon sx={{ fontSize: 18 }} />}
          color={avg(series.map((s) => s.comprometidoPercent)) > 85 ? "#f43f5e" : "#f59e0b"}
          bg={avg(series.map((s) => s.comprometidoPercent)) > 85 ? "#ffe4e6" : "#fef3c7"}
          sub={tendCompr.dir === "up" ? "Crescendo ↑" : tendCompr.dir === "down" ? "Caindo ↓" : "Estável →"}
          subColor={tendCompr.dir === "up" ? "#f43f5e" : tendCompr.dir === "down" ? "#10b981" : "#94a3b8"}
        />
      </Box>

      {/* ── Gráfico 1: Fluxo de Caixa ── */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            title="Fluxo de Caixa"
            subtitle="Entradas vs. saídas totais + margem disponível"
            info="Mostra quanto entrou, quanto saiu e quanto sobrou ou faltou em cada mês."
          />
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={58} />
              <RechartsTooltip content={<FluxoTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>}
              />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2} fill="url(#gradEntradas)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="totalSaidas" name="Saídas" stroke="#f43f5e" strokeWidth={2} fill="url(#gradSaidas)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="margem" name="Disponível" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: "#6366f1", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
          {/* Legend de cores manual para clareza */}
          <Box sx={{ display: "flex", gap: 2.5, mt: 1, flexWrap: "wrap" }}>
            {[
              { color: "#10b981", label: "Entradas" },
              { color: "#f43f5e", label: "Saídas totais" },
              { color: "#6366f1", label: "Disponível (tracejado)" },
            ].map(({ color, label }) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Gráfico 2: Composição das Saídas ── */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            title="Composição das Saídas"
            subtitle="Distribuição por tipo de gasto + linha de entradas"
            info="Permite identificar quais categorias estão crescendo e quando os gastos ultrapassam a renda."
          />
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={58} />
              <RechartsTooltip content={<ComposicaoTooltip />} cursor={{ fill: "rgba(241,245,249,0.6)" }} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>}
              />
              <Bar dataKey="gastosFixos"     name="Fixos"        stackId="s" fill="#f97316" radius={[0,0,0,0]} />
              <Bar dataKey="gastosVariaveis" name="Variáveis"    stackId="s" fill="#eab308" radius={[0,0,0,0]} />
              <Bar dataKey="gastosSazonais"  name="Sazonais"     stackId="s" fill="#a855f7" radius={[0,0,0,0]} />
              <Bar dataKey="compromissos"    name="Compromissos" stackId="s" fill="#3b82f6" radius={[0,0,0,0]} />
              <Bar dataKey="gastosCartoes"   name="Cartões"      stackId="s" fill="#ec4899" radius={[4,4,0,0]} />
              <Line type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Gráfico 3: % Comprometido ── */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            title="% da Renda Comprometida"
            subtitle="Percentual mensal comprometido com gastos e compromissos"
            info="Inclui gastos fixos, variáveis, sazonais, compromissos, faturas de cartão e margem reservada. Meta: abaixo de 85%."          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Chip
              label="Meta: 85%"
              size="small"
              sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.7rem" }}
            />
            {avg(series.map((s) => s.comprometidoPercent)) > 85 ? (
              <Chip label="Acima da meta no período" size="small" sx={{ bgcolor: "#ffe4e6", color: "#9f1239", fontWeight: 600, fontSize: "0.7rem" }} />
            ) : (
              <Chip label="Dentro da meta no período" size="small" sx={{ bgcolor: "#dcfce7", color: "#14532d", fontWeight: 600, fontSize: "0.7rem" }} />
            )}
          </Box>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCompr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                domain={[0, Math.max(100, Math.ceil(Math.max(...chartData.map((d) => d.comprometido)) / 10) * 10)]}
                width={42}
              />
              <RechartsTooltip content={<CompromissoTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
              <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Meta 85%", fill: "#b45309", fontSize: 10, position: "right" }} />
              <Area
                type="monotone"
                dataKey="comprometido"
                name="Comprometido"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#gradCompr)"
                dot={{ fill: "#f59e0b", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Gráfico 4: Planejado vs Realizado ── */}
      {hasRealizado && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader
              title="Planejado vs. Realizado"
              subtitle="Total de saídas: orçamento planejado comparado ao que foi registrado"
              info="Compara o total de gastos planejados com o que você registrou como realizado no mês. Saídas incluem gastos e compromissos, exceto a margem."
            />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={58} />
                <RechartsTooltip content={<RealTooltip />} cursor={{ fill: "rgba(241,245,249,0.6)" }} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>}
                />
                <Bar dataKey="planejado" name="Planejado" fill="#c7d2fe" stroke="#6366f1" strokeWidth={1} radius={[4,4,0,0]} />
                <Bar dataKey="realizado" name="Realizado" fill="#0ea5e9" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

    </Box>
  );
}
