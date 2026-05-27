"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Alert from "@mui/material/Alert";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import { formatBRL } from "@/lib/utils/currency";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useTheme } from "@mui/material/styles";
import { InsightCard } from "@/components/ui/InsightCard";
import { analyzeFotografia } from "@/lib/insights/rules/fotografia";

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

interface Item { id: string; nome: string; valor?: string; valorMensal?: string; ativo: boolean }
interface ItemVariavel extends Item { periodoInput: string | null }
interface ItemSazonal extends Item { mesesOcorrencia: number[] }

interface FotografiaData {
  entradas: { items: Item[]; totalPlanejado: number };
  compromissos: { items: Item[]; totalMensal: number };
  gastos: {
    fixos: { items: Item[]; total: number };
    variaveis: { items: ItemVariavel[]; totalSemanal: number; totalMensal: number };
    sazonais: { items: ItemSazonal[]; totalAnual: number; totalMensal: number; alertaMes: ItemSazonal[] };
  };
  config: { margemPercent: number; tetoCreditCard: number | null; notasPlanoAcao: string | null };
  margem: { percent: number; valor: number };
  disponivel: number;
  comprometidoPercent: number;
  realizado: Record<string, number | null>;
  hasData: boolean;
  cartoes?: {
    total: number;
    teto: number | null;
    items: Array<{ cartaoId: string; nome: string; cor: string | null; limite: number; total: number }>;
  };
}

function toMesAno(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function parseMesAno(mesAno: string): Date {
  const [y, m] = mesAno.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export default function FotografiaPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "você";

  const [mesAno, setMesAno] = useState(() => toMesAno(new Date()));
  const [modo, setModo] = useState<"planejado" | "real">("planejado");
  const [data, setData] = useState<FotografiaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [planoAberto, setPlanoAberto] = useState(false);
  const [notasPlano, setNotasPlano] = useState("");
  const [savingNotas, setSavingNotas] = useState(false);
  const [realizadoEdit, setRealizadoEdit] = useState<Record<string, number>>({});
  const [savingRealizado, setSavingRealizado] = useState<Record<string, boolean>>({});

  const mesDate = parseMesAno(mesAno);
  const mesLabel = `${MONTH_NAMES[mesDate.getMonth()]} ${mesDate.getFullYear()}`;

  const navMes = (delta: number) => {
    const d = parseMesAno(mesAno);
    d.setMonth(d.getMonth() + delta);
    setMesAno(toMesAno(d));
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/fotografia?mesAno=${mesAno}`, { cache: "no-store" })
      .then(async (r) => {
        const text = await r.text();
        if (!text) throw new Error("empty_response");
        return JSON.parse(text);
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
          setNotasPlano(res.data.config.notasPlanoAcao ?? "");
          const plannedMap: Record<string, number> = {
            ENTRADAS:          res.data.entradas.totalPlanejado,
            COMPROMISSOS:      res.data.compromissos.totalMensal,
            GASTOS_FIXOS:      res.data.gastos.fixos.total,
            GASTOS_VARIAVEIS:  res.data.gastos.variaveis.totalMensal,
            GASTOS_SAZONAIS:   res.data.gastos.sazonais.totalMensal,
          };
          const init: Record<string, number> = {};
          for (const [k, v] of Object.entries(res.data.realizado as Record<string, number | null>)) {
            init[k] = v != null ? Math.round(v * 100) : Math.round((plannedMap[k] ?? 0) * 100);
          }
          setRealizadoEdit(init);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mesAno]);

  useEffect(() => { load(); }, [load]);

  const saveRealizado = async (grupo: string) => {
    const cents = realizadoEdit[grupo] ?? 0;
    if (cents === 0) return;
    setSavingRealizado((p) => ({ ...p, [grupo]: true }));
    await fetch("/api/realizado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAno, grupo, valorRealizado: cents / 100 }),
    });
    setSavingRealizado((p) => ({ ...p, [grupo]: false }));
  };

  const saveNotas = async () => {
    setSavingNotas(true);
    await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notasPlanoAcao: notasPlano }),
    });
    setSavingNotas(false);
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (loading) return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 3 }} />)}
      </Box>
    </Box>
  );

  if (!data || !data.hasData) return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
        {`Olá, ${firstName}! \u{1F44B}`}
      </Typography>
      <Card sx={{ border: isDark ? "2px dashed rgba(99,102,241,0.30)" : "2px dashed #c7d2fe", bgcolor: isDark ? "background.paper" : "#fafafe" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#4f46e5" }}>
            Configure sua Fotografia Financeira
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Para montar seu planejamento mensal, siga os 3 passos abaixo:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { step: "1", href: "/entradas", label: "Cadastre suas Entradas", desc: "Salários, freelances e outras receitas" },
              { step: "2", href: "/gastos", label: "Cadastre seus Gastos", desc: "Fixos, variáveis e sazonais" },
              { step: "3", href: "/compromissos", label: "Cadastre seus Compromissos", desc: "Dívidas, investimentos e sonhos" },
            ].map(({ step, href, label, desc }) => (
              <Box key={step} component={Link} href={href} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 2, border: isDark ? "1px solid rgba(99,102,241,0.15)" : "1px solid #e0e7ff", bgcolor: "background.paper", textDecoration: "none", "&:hover": { bgcolor: isDark ? "background.default" : "#eef2ff" }, transition: "background 0.15s" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "#6366f1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>{step}</Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>{label}</Typography>
                  <Typography variant="caption" color="text.secondary">{desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  if (!data) return null;

  const { entradas, compromissos, gastos, margem, disponivel, comprometidoPercent, config, realizado } = data;

  const comprometidoBarW = Math.min(comprometidoPercent, 100);

  const insights = useMemo(
    () => analyzeFotografia({ entradas, compromissos, gastos, config, margem, disponivel, comprometidoPercent, realizado, cartoes: data?.cartoes }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const cardConfig = [
    { key: "ENTRADAS",        label: "Entradas",          icon: TrendingUpRoundedIcon,     color: "#10b981", bg: isDark ? "rgba(16,185,129,0.10)" : "#ecfdf5", border: isDark ? "rgba(16,185,129,0.22)" : "#a7f3d0", valor: entradas.totalPlanejado },
    { key: "COMPROMISSOS",    label: "Compromissos",       icon: AccountBalanceRoundedIcon, color: "#6366f1", bg: isDark ? "rgba(99,102,241,0.10)" : "#eef2ff", border: isDark ? "rgba(99,102,241,0.22)" : "#c7d2fe", valor: compromissos.totalMensal },
    { key: "GASTOS_FIXOS",    label: "Gastos Fixos",       icon: LockRoundedIcon,           color: "#f97316", bg: isDark ? "rgba(249,115,22,0.10)" : "#fff7ed", border: isDark ? "rgba(249,115,22,0.22)" : "#fed7aa", valor: gastos.fixos.total },
    { key: "GASTOS_VARIAVEIS",label: "Gastos Variáveis",   icon: ShoppingCartRoundedIcon,   color: "#eab308", bg: isDark ? "rgba(234,179,8,0.10)" : "#fefce8", border: isDark ? "rgba(234,179,8,0.22)" : "#fde68a", valor: gastos.variaveis.totalMensal },
    { key: "GASTOS_SAZONAIS", label: "Gastos Sazonais",    icon: AutoAwesomeRoundedIcon,    color: "#a855f7", bg: isDark ? "rgba(168,85,247,0.10)" : "#faf5ff", border: isDark ? "rgba(168,85,247,0.22)" : "#e9d5ff", valor: gastos.sazonais.totalMensal },
    { key: "MARGEM",          label: `Margem (${margem.percent}%)`, icon: SavingsRoundedIcon, color: "#64748b", bg: isDark ? "rgba(100,116,139,0.10)" : "#f8fafc", border: isDark ? "rgba(100,116,139,0.22)" : "#e2e8f0", valor: margem.valor },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Nav do mês + toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          position: "sticky",
          top: { xs: 56, md: 0 },
          zIndex: 10,
          bgcolor: "background.default",
          py: 1,
          mx: { xs: -2, md: 0 },
          px: { xs: 2, md: 0 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => navMes(-1)} size="small"><ChevronLeftRoundedIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, minWidth: 180, textAlign: "center", letterSpacing: "-0.02em" }}>{mesLabel}</Typography>
          <IconButton onClick={() => navMes(1)} size="small"><ChevronRightRoundedIcon /></IconButton>
        </Box>
        <ToggleButtonGroup value={modo} exclusive onChange={(_: React.MouseEvent, v: "planejado" | "real") => { if (v) setModo(v); }} size="small">
          <ToggleButton value="planejado" sx={{ px: 2, fontSize: "0.8rem" }}>Planejado</ToggleButton>
          <ToggleButton value="real" sx={{ px: 2, fontSize: "0.8rem" }}>Real vs Planejado</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Insights */}
      <InsightCard insights={insights} />

      {/* Alertas */}
      {gastos.sazonais.alertaMes.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          ?? Este mês você tem gasto(s) sazonal(is): <strong>{gastos.sazonais.alertaMes.map((g: ItemSazonal) => g.nome).join(", ")}</strong>
        </Alert>
      )}
      {config.tetoCreditCard != null && data?.cartoes != null && data.cartoes.total > config.tetoCreditCard && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Fatura dos cartões ({formatBRL(data.cartoes.total)}) acima do teto configurado ({formatBRL(config.tetoCreditCard)})
        </Alert>
      )}

      {/* Hero — Disponível */}
      <Card sx={{
        background: disponivel >= 0
          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
          : "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
        border: "none",
        boxShadow: disponivel >= 0
          ? "0 10px 30px -5px rgba(16,185,129,0.35)"
          : "0 10px 30px -5px rgba(244,63,94,0.35)",
        color: "white",
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.75)", mb: 0.5 }}>
            DISPONÍVEL NO MÊS
          </Typography>
          <Typography sx={{ fontSize: "2.75rem", fontWeight: 900, letterSpacing: "-0.04em", fontFamily: "monospace", lineHeight: 1 }}>
            {formatBRL(disponivel)}
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", mt: 1 }}>
            {comprometidoPercent.toFixed(1)}% das entradas comprometidas
          </Typography>
          <Box sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${comprometidoBarW}%`, bgcolor: "white", borderRadius: 4, transition: "width 0.5s ease" }} />
          </Box>
        </CardContent>
      </Card>

      {/* Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
        {cardConfig.map(({ key, label, icon: Icon, color, bg, border, valor }) => (
          <Card key={key} sx={{ border: `1px solid ${border}`, bgcolor: bg }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Icon sx={{ color, fontSize: 20 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "monospace", color, letterSpacing: "-0.03em" }}>
                {formatBRL(valor)}
              </Typography>
              {modo === "real" && key !== "MARGEM" && (
                <Box sx={{ mt: 1.5, display: "flex", gap: 1, alignItems: "center" }}>
                  <CurrencyInput
                    size="small"
                    label="Valor real"
                    valueCents={realizadoEdit[key] ?? 0}
                    onValueChange={(cents) => setRealizadoEdit((p) => ({ ...p, [key]: cents }))}
                    sx={{ flex: 1, "& .MuiInputBase-root": { bgcolor: "white" } }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disabled={savingRealizado[key]}
                    onClick={() => saveRealizado(key)}
                    sx={{ bgcolor: color, "&:hover": { bgcolor: color, filter: "brightness(0.9)" }, minWidth: 60 }}
                  >
                    {savingRealizado[key] ? "..." : "Salvar"}
                  </Button>
                </Box>
              )}
              {modo === "real" && key !== "MARGEM" && realizado[key] != null && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={`Real: ${formatBRL(realizado[key]!)}`}
                    sx={{ bgcolor: "background.paper", border: `1px solid ${border}`, fontSize: "0.7rem" }}
                  />
                  {realizado[key]! > valor && key !== "ENTRADAS" && (
                    <Chip size="small" label="acima" color="error" sx={{ fontSize: "0.7rem" }} />
                  )}
                  {realizado[key]! < valor && key === "ENTRADAS" && (
                    <Chip size="small" label="abaixo" color="warning" sx={{ fontSize: "0.7rem" }} />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Fórmula cascata */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}>Fórmula do Mês</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {[
              { label: "+ Entradas",             valor: entradas.totalPlanejado,          color: "success.main" },
              { label: "- Compromissos",          valor: compromissos.totalMensal,         color: "text.secondary" },
              { label: "- Gastos Fixos",          valor: gastos.fixos.total,               color: "text.secondary" },
              { label: "- Gastos Variáveis",      valor: gastos.variaveis.totalMensal,     color: "text.secondary" },
              { label: "- Gastos Sazonais (avg)", valor: gastos.sazonais.totalMensal,      color: "text.secondary" },
              { label: `- Margem (${margem.percent}%)`, valor: margem.valor,               color: "text.secondary" },
              ...(data?.cartoes && data.cartoes.total > 0
                ? [{ label: "- Cartões de Crédito", valor: data.cartoes.total, color: "text.secondary" }]
                : []),
            ].map(({ label, valor: v, color }) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color={color}>{label}</Typography>
                <Typography variant="body2" color={color} sx={{ fontFamily: "monospace" }}>{formatBRL(v)}</Typography>
              </Box>
            ))}
            <Box sx={{ height: "1px", bgcolor: "divider", my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: disponivel >= 0 ? "success.main" : "error.main" }}>= Disponível</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: "monospace", color: disponivel >= 0 ? "success.main" : "error.main" }}>{formatBRL(disponivel)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Cartões de Crédito */}
      {data?.cartoes && data.cartoes.items.length > 0 && (() => {
        const { total: totalCart, teto, items } = data.cartoes!;
        const pctTeto = teto && teto > 0 ? Math.min((totalCart / teto) * 100, 100) : null;
        const tetoColor = pctTeto == null ? "#94a3b8" : pctTeto >= 90 ? "#ef4444" : pctTeto >= 70 ? "#f59e0b" : "#22c55e";
        return (
          <Card sx={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Cartões de Crédito</Typography>
                <Link href="/cartoes" style={{ textDecoration: "none" }}>
                  <Typography variant="caption" sx={{ color: "primary.light", cursor: "pointer" }}>Ver todos →</Typography>
                </Link>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: tetoColor }}>{formatBRL(totalCart)}</Typography>
                {teto && <Typography variant="caption" color="text.secondary">teto: {formatBRL(teto)}</Typography>}
              </Box>
              {pctTeto != null && (
                <Box sx={{ mb: 2, height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: `${pctTeto}%`, bgcolor: tetoColor, borderRadius: 3 }} />
                </Box>
              )}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {items.map((c) => {
                  const pct = c.limite > 0 ? Math.min((c.total / c.limite) * 100, 100) : 0;
                  const cc = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : (c.cor ?? "#64748b");
                  return (
                    <Box key={c.cartaoId}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.cor ?? "#64748b", flexShrink: 0 }} />
                          <Typography variant="caption">{c.nome}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontFamily: "monospace", color: cc }}>{formatBRL(c.total)}</Typography>
                      </Box>
                      <Box sx={{ height: 3, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: cc, borderRadius: 1.5 }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        );
      })()}

      {/* Plano de Ação */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setPlanoAberto((p) => !p)}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>Plano de Ação</Typography>
            {planoAberto ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
          </Box>
          <Collapse in={planoAberto}>
            <Box sx={{ mt: 2 }}>
              <TextField multiline rows={5} fullWidth placeholder="Anote aqui suas metas, cortes planejados, ajustes para o mês..." value={notasPlano} onChange={(e) => setNotasPlano(e.target.value)} />
              <Button variant="contained" size="small" onClick={saveNotas} disabled={savingNotas} sx={{ mt: 1.5 }}>
                {savingNotas ? "Salvando..." : "Salvar Plano"}
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
}
