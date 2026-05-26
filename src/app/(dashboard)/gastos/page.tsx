"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import Fab from "@mui/material/Fab";
import Collapse from "@mui/material/Collapse";
import Menu from "@mui/material/Menu";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import { formatBRL } from "@/lib/utils/currency";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

interface Gasto {
  id: string;
  nome: string;
  tipo: "FIXO" | "VARIAVEL" | "SAZONAL";
  valor: string;
  periodoInput: "SEMANAL" | "MENSAL" | null;
  mesesOcorrencia: number[];
  ativo: boolean;
  dataInicio: string;
  dataFim: string | null;
  notas: string | null;
  icone: string | null;
}

function formatPeriodo(dataInicio: string | null | undefined, dataFim: string | null | undefined): string {
  if (!dataInicio) return "";
  const fmt = (d: string) => {
    const [y, m] = d.slice(0, 7).split("-");
    return `${MESES[parseInt(m) - 1]}/${y}`;
  };
  return dataFim ? `${fmt(dataInicio)} – ${fmt(dataFim)}` : `desde ${fmt(dataInicio)}`;
}

type GastoStatus = "ativo" | "inativo" | "encerrado" | "futuro";
const STATUS_CONFIG: Record<GastoStatus, { label: string; color: string; bg: string; darkBg: string }> = {
  ativo:     { label: "Ativo",     color: "#16a34a", bg: "#dcfce7", darkBg: "rgba(22,163,74,0.12)" },
  inativo:   { label: "Inativo",   color: "#64748b", bg: "#f1f5f9", darkBg: "rgba(100,116,139,0.12)" },
  encerrado: { label: "Encerrado", color: "#dc2626", bg: "#fee2e2", darkBg: "rgba(220,38,38,0.12)" },
  futuro:    { label: "Futuro",    color: "#2563eb", bg: "#dbeafe", darkBg: "rgba(37,99,235,0.12)" },
};

function getStatus(item: Gasto, todayStr: string): GastoStatus {
  const start = (item.dataInicio ?? todayStr).slice(0, 10);
  const end = item.dataFim ? item.dataFim.slice(0, 10) : null;
  if (!item.ativo) return "inativo";
  if (end && end < todayStr) return "encerrado";
  if (start > todayStr) return "futuro";
  return "ativo";
}

const SEMANAS_MES = 52 / 12;
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function gastoMensal(g: Gasto): number {
  const v = parseFloat(g.valor);
  if (g.tipo === "FIXO") return v;
  if (g.tipo === "VARIAVEL") return g.periodoInput === "SEMANAL" ? v * SEMANAS_MES : v;
  return (v * g.mesesOcorrencia.length) / 12;
}

function formatDias(days: number): string {
  if (days < 30) return `${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 mês" : `${months} meses`;
}
const ICONES_GASTO = [
  { key: "casa",        label: "Moradia",     Icon: HomeRoundedIcon },
  { key: "carro",       label: "Transporte",  Icon: DirectionsCarRoundedIcon },
  { key: "compras",     label: "Compras",     Icon: ShoppingCartRoundedIcon },
  { key: "alimentacao", label: "Alimentação", Icon: RestaurantRoundedIcon },
  { key: "saude",       label: "Saúde",       Icon: LocalHospitalRoundedIcon },
  { key: "educacao",    label: "Educação",   Icon: SchoolRoundedIcon },
  { key: "energia",     label: "Energia",     Icon: BoltRoundedIcon },
  { key: "telefone",    label: "Comunicação", Icon: PhoneAndroidRoundedIcon },
  { key: "lazer",       label: "Lazer",       Icon: SportsEsportsRoundedIcon },
  { key: "pets",        label: "Pets",        Icon: PetsRoundedIcon },
  { key: "viagem",      label: "Viagens",     Icon: FlightRoundedIcon },
  { key: "beleza",      label: "Beleza",      Icon: ContentCutRoundedIcon },
  { key: "academia",    label: "Academia",    Icon: FitnessCenterRoundedIcon },
  { key: "financas",    label: "Finanças",    Icon: CreditCardRoundedIcon },
  { key: "familia",     label: "Família",     Icon: ChildCareRoundedIcon },
] as const;

function GastoIcone({ iconKey, color, size = 20 }: { iconKey: string | null | undefined; color: string; size?: number }) {
  const match = ICONES_GASTO.find((i) => i.key === iconKey);
  if (!match) return null;
  const { Icon } = match;
  return (
    <Box sx={{ width: size + 10, height: size + 10, borderRadius: "50%", bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: size, color }} />
    </Box>
  );
}
function getCockpitMetrics(item: Gasto, todayStr: string) {
  const mensal = gastoMensal(item);
  const anual = mensal * 12;
  const start = (item.dataInicio ?? todayStr).slice(0, 10);
  const end = item.dataFim ? item.dataFim.slice(0, 10) : null;
  const startDate = new Date(start);
  const todayDate = new Date(todayStr);
  const daysActive = Math.max(0, Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  let periodProgress: number | null = null;
  let daysRemaining: number | null = null;
  if (end) {
    const endDate = new Date(end);
    const totalDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const elapsed = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    periodProgress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
    daysRemaining = Math.max(0, Math.floor((endDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)));
  }
  let nextOcorrencia: string | null = null;
  if (item.tipo === "SAZONAL" && item.mesesOcorrencia.length > 0) {
    const currentMonth = parseInt(todayStr.slice(5, 7));
    const next = item.mesesOcorrencia.find((m) => m >= currentMonth) ?? item.mesesOcorrencia[0];
    nextOcorrencia = MESES[next - 1];
  }
  const valorSemanal = item.tipo === "VARIAVEL" && item.periodoInput === "SEMANAL" ? parseFloat(item.valor) : null;
  return { mensal, anual, daysActive, periodProgress, daysRemaining, nextOcorrencia, valorSemanal };
}

export default function GastosPage() {
  const [items, setItems] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // form state
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"FIXO" | "VARIAVEL" | "SAZONAL">("FIXO");
  const [valorCents, setValorCents] = useState(0);
  const [periodoInput, setPeriodoInput] = useState<"SEMANAL" | "MENSAL">("MENSAL");
  const [meses, setMeses] = useState<number[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [notas, setNotas] = useState("");
  const [icone, setIcone] = useState<string | null>(null);

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const tipoByTab: Record<number, "FIXO" | "VARIAVEL" | "SAZONAL"> = { 0: "FIXO", 1: "VARIAVEL", 2: "SAZONAL" };

  const load = () => {
    fetch("/api/gastos", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { setItems(res.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const saved = localStorage.getItem("gastos_view_mode") as "list" | "grid" | null;
    if (saved) setViewMode(saved);
  }, []);

  const openNew = () => {
    const t = tipoByTab[tab];
    setEditing(null);
    setNome(""); setTipo(t); setValorCents(0); setPeriodoInput("MENSAL"); setMeses([]);
    setDataInicio(new Date().toISOString().slice(0, 10)); setDataFim(""); setNotas(""); setIcone(null);
    setDialogOpen(true);
  };

  const openEdit = (item: Gasto) => {
    setEditing(item);
    setNome(item.nome); setTipo(item.tipo); setValorCents(Math.round(parseFloat(item.valor) * 100));
    setPeriodoInput(item.periodoInput ?? "MENSAL"); setMeses(item.mesesOcorrencia ?? []);
    setDataInicio(item.dataInicio.slice(0, 10)); setDataFim(item.dataFim ? item.dataFim.slice(0, 10) : ""); setNotas(item.notas ?? ""); setIcone(item.icone ?? null);
    setDialogOpen(true);
  };

  const toggleMes = (m: number) => setMeses((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b));

  const handleSave = async () => {
    if (!nome.trim() || valorCents === 0) return;
    setSaving(true);
    const body: Record<string, unknown> = { nome: nome.trim(), tipo, valor: valorCents / 100, dataInicio, dataFim: dataFim || null, notas: notas.trim() || null, icone: icone || null };
    if (tipo === "VARIAVEL") body.periodoInput = periodoInput;
    if (tipo === "SAZONAL") body.mesesOcorrencia = meses;
    if (editing) {
      await fetch(`/api/gastos/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/gastos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const handleToggleAtivo = async (item: Gasto) => {
    await fetch(`/api/gastos/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: !item.ativo }) });
    load();
  };

  const handleDelete = (id: string) => {
    setDeleteDialogId(id);
    setMenuAnchor(null);
    setMenuItemId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogId) return;
    setDeletingId(deleteDialogId);
    await fetch(`/api/gastos/${deleteDialogId}`, { method: "DELETE" });
    setDeletingId(null);
    setDeleteDialogId(null);
    load();
  };

  const handleViewMode = (_: React.MouseEvent, mode: "list" | "grid" | null) => {
    if (!mode) return;
    setViewMode(mode);
    localStorage.setItem("gastos_view_mode", mode);
  };

  const tabColors = ["#f97316", "#eab308", "#a855f7"];
  const tabBgs = isDark ? ["rgba(249,115,22,0.10)", "rgba(234,179,8,0.10)", "rgba(168,85,247,0.10)"] : ["#fff7ed", "#fefce8", "#faf5ff"];
  const tabBorders = isDark ? ["rgba(249,115,22,0.22)", "rgba(234,179,8,0.22)", "rgba(168,85,247,0.22)"] : ["#fed7aa", "#fde68a", "#e9d5ff"];
  const tabTipos: ("FIXO" | "VARIAVEL" | "SAZONAL")[] = ["FIXO", "VARIAVEL", "SAZONAL"];
  const TIPO_GASTO_CONFIG = {
    FIXO:     { color: tabColors[0], bg: tabBgs[0], border: tabBorders[0], label: "Fixo",     Icon: RepeatRoundedIcon,      desc: "Mesmo valor todo mês — aluguel, assinaturas, parcelas..." },
    VARIAVEL: { color: tabColors[1], bg: tabBgs[1], border: tabBorders[1], label: "Variável", Icon: SwapVertRoundedIcon,     desc: "Valor oscila mês a mês — luz, água, alimentação..." },
    SAZONAL:  { color: tabColors[2], bg: tabBgs[2], border: tabBorders[2], label: "Sazonal",  Icon: EventRepeatRoundedIcon,  desc: "Ocorre em meses específicos — IPTU, revisão anual..." },
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredItems = items.filter((i) => i.tipo === tabTipos[tab]);
  const isAtivo = (i: Gasto) => {
    const start = (i.dataInicio ?? todayStr).slice(0, 10);
    const end = i.dataFim ? i.dataFim.slice(0, 10) : null;
    return i.ativo && start <= todayStr && (end === null || end >= todayStr);
  };
  const totalMensalFixo = items.filter(i => i.tipo === "FIXO" && isAtivo(i)).reduce((acc, i) => acc + gastoMensal(i), 0);
  const totalMensalVar = items.filter(i => i.tipo === "VARIAVEL" && isAtivo(i)).reduce((acc, i) => acc + gastoMensal(i), 0);
  const totalMensalSaz = items.filter(i => i.tipo === "SAZONAL" && isAtivo(i)).reduce((acc, i) => acc + gastoMensal(i), 0);
  const totals = [totalMensalFixo, totalMensalVar, totalMensalSaz];

  const valPreview = valorCents / 100;
  const previewMensal = tipo === "VARIAVEL" && periodoInput === "SEMANAL" ? valPreview * SEMANAS_MES
    : tipo === "SAZONAL" ? (valPreview * meses.length) / 12 : 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ReceiptLongRoundedIcon sx={{ color: "#f97316", fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Gastos</Typography>
            <Typography variant="body2" color="text.secondary">Fixos, variáveis e sazonais</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewMode} size="small" sx={{ "& .MuiToggleButton-root": { border: "1px solid #e2e8f0", py: 0.5, px: 0.75 } }}>
            <ToggleButton value="list"><ViewListRoundedIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="grid"><ViewModuleRoundedIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew} sx={{ borderRadius: 2, display: { xs: "none", md: "flex" } }}>
            Novo Gasto
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: "1px solid #e2e8f0" }}>
        {["Fixos", "Variáveis", "Sazonais"].map((label, i) => (
          <Tab key={i} label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {label}
              <Chip label={formatBRL(totals[i])} size="small" sx={{ bgcolor: tabBgs[i], color: tabColors[i], fontWeight: 700, fontSize: "0.7rem" }} />
            </Box>
          } />
        ))}
      </Tabs>

      {/* Lista */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : filteredItems.length === 0 ? (
        <Card sx={{ border: `2px dashed ${tabBorders[tab]}`, bgcolor: tabBgs[tab] }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">Nenhum gasto {["fixo", "variável", "sazonal"][tab]} cadastrado.</Typography>
            <Button variant="outlined" onClick={openNew} sx={{ mt: 2 }}>Cadastrar</Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 2 }}>
          {filteredItems.map((item) => {
            const status = getStatus(item, todayStr);
            const sc = STATUS_CONFIG[status];
            const metrics = getCockpitMetrics(item, todayStr);
            const stats: { label: string; value: string }[] =
              item.tipo === "VARIAVEL" && item.periodoInput === "SEMANAL"
                ? [
                    { label: "Por semana", value: formatBRL(metrics.valorSemanal ?? 0) },
                    { label: "Mensal", value: formatBRL(metrics.mensal) },
                    { label: "Anual", value: formatBRL(metrics.anual) },
                  ]
                : item.tipo === "SAZONAL"
                ? [
                    { label: "Próxima", value: metrics.nextOcorrencia ?? "—" },
                    { label: "Ocorrências", value: `${item.mesesOcorrencia.length}x/ano` },
                    { label: "Total/ano", value: formatBRL(metrics.anual) },
                  ]
                : [
                    { label: "Anual", value: formatBRL(metrics.anual) },
                    { label: "Ativo há", value: status === "futuro" ? "Futuro" : formatDias(metrics.daysActive) },
                    { label: "Período", value: formatPeriodo(item.dataInicio, item.dataFim) || "—" },
                  ];
            return (
              <Card
                key={item.id}
                sx={{
                  border: `1px solid ${tabBorders[tab]}`,
                  borderLeft: `4px solid ${sc.color}`,
                  bgcolor: tabBgs[tab],
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Chip label={sc.label} size="small" sx={{ bgcolor: isDark ? sc.darkBg : sc.bg, color: sc.color, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                    <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuItemId(item.id); }}>
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <GastoIcone iconKey={item.icone} color={sc.color} size={18} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{item.nome}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1.75rem", color: tabColors[tab], lineHeight: 1 }}>
                      {formatBRL(metrics.mensal)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">/mês</Typography>
                  </Box>
                  <Box sx={{ height: "1px", bgcolor: tabBorders[tab] }} />
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0.5 }}>
                    {stats.map((s, i) => (
                      <Box key={i}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>{s.label}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem" }}>{s.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                  {metrics.periodProgress !== null && (
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {metrics.daysRemaining === 0
                            ? "Encerrado"
                            : metrics.daysRemaining! < 30
                            ? `Encerra em ${metrics.daysRemaining}d`
                            : `Encerra em ${Math.floor(metrics.daysRemaining! / 30)} meses`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{Math.round(metrics.periodProgress)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={metrics.periodProgress}
                        sx={{ borderRadius: 1, height: 6, bgcolor: isDark ? sc.darkBg : sc.bg, "& .MuiLinearProgress-bar": { bgcolor: sc.color } }}
                      />
                    </Box>
                  )}
                  {item.tipo === "SAZONAL" && item.mesesOcorrencia.length > 0 && (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {item.mesesOcorrencia.map((m) => (
                        <Chip key={m} label={MESES[m - 1]} size="small" sx={{ fontSize: "0.6rem", height: 18 }} />
                      ))}
                    </Box>
                  )}
                  {item.notas && (
                    <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
                      <NotesRoundedIcon sx={{ fontSize: 12, color: "text.disabled", mt: "2px", flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.notas}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filteredItems.map((item) => {
            const mensal = gastoMensal(item);
            const status = getStatus(item, todayStr);
            const sc = STATUS_CONFIG[status];
            const isExpanded = expandedId === item.id;
            return (
              <Card
                key={item.id}
                sx={{
                  border: `1px solid ${tabBorders[tab]}`,
                  borderLeft: `4px solid ${sc.color}`,
                  bgcolor: tabBgs[tab],
                  transition: "all 0.2s",
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  {/* Main row */}
                  <Box
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, cursor: "pointer", userSelect: "none" }}
                  >
                    <GastoIcone iconKey={item.icone} color={sc.color} size={18} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{item.nome}</Typography>
                        <Chip
                          label={sc.label}
                          size="small"
                          sx={{ bgcolor: isDark ? sc.darkBg : sc.bg, color: sc.color, fontWeight: 700, fontSize: "0.65rem", height: 20, flexShrink: 0 }}
                        />
                      </Box>
                      {(item.tipo === "VARIAVEL" || item.tipo === "SAZONAL") && (
                        <Typography variant="caption" color="text.secondary">
                          {item.tipo === "VARIAVEL" && item.periodoInput === "SEMANAL"
                            ? `${formatBRL(item.valor)}/sem → ${formatBRL(mensal)}/mês`
                            : item.tipo === "SAZONAL"
                            ? `${formatBRL(item.valor)}/ocorrência · ${item.mesesOcorrencia.length}x/ano (média)`
                            : null}
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1.1rem", color: tabColors[tab], flexShrink: 0 }}>
                      {formatBRL(mensal)}
                      <Typography component="span" variant="caption" color="text.secondary">/mês</Typography>
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuItemId(item.id); }}
                      sx={{ flexShrink: 0 }}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Expanded section */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2, pt: 1, pb: 1.5, display: "flex", flexDirection: "column", gap: 1, borderTop: `1px solid ${tabBorders[tab]}` }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatPeriodo(item.dataInicio, item.dataFim) || "Período não definido"}
                        </Typography>
                      </Box>
                      {item.mesesOcorrencia.length > 0 && (
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {item.mesesOcorrencia.map((m) => (
                            <Chip key={m} label={MESES[m - 1]} size="small" sx={{ fontSize: "0.65rem", height: 20 }} />
                          ))}
                        </Box>
                      )}
                      {item.notas && (
                        <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
                          <NotesRoundedIcon sx={{ fontSize: 13, color: "text.disabled", mt: "2px" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{item.notas}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Dialog */}
      <Fab
        color="primary"
        onClick={openNew}
        sx={{ display: { xs: "flex", md: "none" }, position: "fixed", bottom: 80, right: 16, zIndex: 1200 }}
      >
        <AddRoundedIcon />
      </Fab>

      {/* ── Form Drawer ─────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 }, display: "flex", flexDirection: "column" } } }}
      >
        {/* Colored header — color derived from current tipo */}
        {(() => {
          const tc = TIPO_GASTO_CONFIG[tipo];
          const selectedIcone = ICONES_GASTO.find((i) => i.key === icone);
          const HeaderIcon = selectedIcone ? selectedIcone.Icon : ReceiptLongRoundedIcon;
          return (
            <Box sx={{ background: `linear-gradient(135deg, ${tc.color}ee 0%, ${tc.color} 100%)`, px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
              <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
                  <HeaderIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                    {editing ? `Editar Gasto` : `Novo Gasto`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                    {tc.desc}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })()}

        {/* Scrollable form body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>

          {/* ── Tipo ── */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", display: "block", mb: 1.5 }}>
              Tipo de gasto
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
              {(["FIXO", "VARIAVEL", "SAZONAL"] as const).map((t) => {
                const tc = TIPO_GASTO_CONFIG[t];
                const TipoIcon = tc.Icon;
                const selected = tipo === t;
                return (
                  <Box key={t} onClick={() => setTipo(t)} sx={{ p: 1.5, borderRadius: 2, textAlign: "center", cursor: "pointer", border: "2px solid", borderColor: selected ? tc.color : "divider", bgcolor: selected ? tc.bg : "background.paper", transition: "all 0.15s", "&:hover": { borderColor: tc.color, bgcolor: tc.bg } }}>
                    <TipoIcon sx={{ fontSize: 22, color: selected ? tc.color : "text.disabled", display: "block", mx: "auto", mb: 0.5 }} />
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: selected ? tc.color : "text.secondary", fontSize: "0.7rem", lineHeight: 1.2 }}>
                      {tc.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Divider />

          {/* ── Identificação ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
              Identificação
            </Typography>

            {/* Nome */}
            <TextField
              label="Nome do gasto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              autoFocus={!editing}
              placeholder="Ex: Aluguel, Academia, Netflix..."
              helperText="Como você identifica esse gasto"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
            />

            {/* Ícone grid */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
                Ícone (opcional)
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}>
                {ICONES_GASTO.map(({ key, label, Icon }) => {
                  const selected = icone === key;
                  const accent = TIPO_GASTO_CONFIG[tipo].color;
                  return (
                    <Box key={key} onClick={() => setIcone(selected ? null : key)} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, p: 1, borderRadius: 2, cursor: "pointer", border: "2px solid", borderColor: selected ? accent : "transparent", bgcolor: selected ? `${accent}15` : "action.hover", transition: "all 0.15s", "&:hover": { borderColor: accent, bgcolor: `${accent}10` } }}>
                      <Icon sx={{ fontSize: 22, color: selected ? accent : "text.secondary" }} />
                      <Typography variant="caption" sx={{ fontSize: "0.58rem", color: selected ? accent : "text.secondary", fontWeight: selected ? 700 : 400, lineHeight: 1.2, textAlign: "center" }}>
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* ── Valor ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
              Valor
            </Typography>

            <CurrencyInput
              label={tipo === "VARIAVEL" && periodoInput === "SEMANAL" ? "Valor por semana" : tipo === "SAZONAL" ? "Valor por ocorrência" : "Valor por mês"}
              valueCents={valorCents}
              onValueChange={setValorCents}
              fullWidth
              required
              helperText={
                tipo === "FIXO" ? "Valor exato que é debitado todo mês" :
                tipo === "VARIAVEL" && periodoInput === "SEMANAL" ? "Valor semanal — será convertido para mês automaticamente" :
                tipo === "SAZONAL" ? "Valor de cada ocorrência selecionada" :
                "Valor médio mensal desse gasto"
              }
            />

            {/* Período (só VARIAVEL) */}
            {tipo === "VARIAVEL" && (
              <FormControl fullWidth size="small">
                <InputLabel>Período de cobrança</InputLabel>
                <Select value={periodoInput} label="Período de cobrança" onChange={(e) => setPeriodoInput(e.target.value as "SEMANAL" | "MENSAL")}>
                  <MenuItem value="MENSAL">Mensal</MenuItem>
                  <MenuItem value="SEMANAL">Semanal (ex: gasolina, mercado)</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Preview VARIAVEL semanal */}
            {tipo === "VARIAVEL" && periodoInput === "SEMANAL" && valorCents > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 2 }}>
                <AttachMoneyRoundedIcon sx={{ fontSize: 18, color: "#3b82f6", flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 600 }}>
                  Equivalente mensal: <strong>{formatBRL(previewMensal)}</strong> (× {SEMANAS_MES.toFixed(1)} semanas/mês)
                </Typography>
              </Box>
            )}

            {/* Meses (só SAZONAL) */}
            {tipo === "SAZONAL" && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
                  Meses em que ocorre
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0.75 }}>
                  {MESES.map((m, i) => {
                    const active = meses.includes(i + 1);
                    return (
                      <Box key={i} onClick={() => toggleMes(i + 1)} sx={{ py: 0.75, borderRadius: 1.5, textAlign: "center", cursor: "pointer", border: "1px solid", borderColor: active ? "#a855f7" : "divider", bgcolor: active ? "#faf5ff" : "background.paper", transition: "all 0.12s", "&:hover": { borderColor: "#a855f7" } }}>
                        <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: active ? 700 : 400, color: active ? "#a855f7" : "text.secondary" }}>
                          {m}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Preview SAZONAL */}
            {tipo === "SAZONAL" && valorCents > 0 && meses.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 2 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#a855f7", flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "#7e22ce", fontWeight: 600 }}>
                  Média mensal: <strong>{formatBRL(previewMensal)}</strong> ({meses.length}× ao ano)
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* ── Vigência ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
                Vigência
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.25 }}>
                Use data de fim para gastos temporários como parcelas ou contratos
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Início"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                fullWidth
                required
                helperText="Quando esse gasto começou"
                slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
              <TextField
                label="Fim (opcional)"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                fullWidth
                helperText="Deixe em branco se contínuo"
                slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Box>
          </Box>

          <Divider />

          {/* ── Observações ── */}
          <TextField
            label="Observações (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Contrato, fornecedor, notas importantes..."
            helperText="Informações extras para lembrar depois"
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><NotesRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />
        </Box>

        {/* Fixed footer */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving || !nome.trim() || valorCents === 0 || !dataInicio}
            sx={{ bgcolor: TIPO_GASTO_CONFIG[tipo].color, "&:hover": { bgcolor: TIPO_GASTO_CONFIG[tipo].color, filter: "brightness(0.9)" } }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>

      {/* MoreVert context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuItemId(null); }}
        slotProps={{ paper: { elevation: 3, sx: { borderRadius: 2, minWidth: 160 } } }}
      >
        <MenuItem onClick={() => { const g = items.find(i => i.id === menuItemId); if (g) openEdit(g); setMenuAnchor(null); }}>
          <EditRoundedIcon sx={{ fontSize: 16, mr: 1.5, color: "text.secondary" }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => { const g = items.find(i => i.id === menuItemId); if (g) handleToggleAtivo(g); setMenuAnchor(null); setMenuItemId(null); }}>
          {items.find(i => i.id === menuItemId)?.ativo ? "Desativar" : "Ativar"}
        </MenuItem>
        <MenuItem onClick={() => { if (menuItemId) handleDelete(menuItemId); }} sx={{ color: "error.main" }}>
          <DeleteRoundedIcon sx={{ fontSize: 16, mr: 1.5 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteDialogId)} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir gasto?</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{items.find(i => i.id === deleteDialogId)?.nome}</strong>? Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogId(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={Boolean(deletingId)}>
            {deletingId ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
