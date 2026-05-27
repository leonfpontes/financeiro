"use client";

import { useEffect, useMemo, useState } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Menu from "@mui/material/Menu";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Fab from "@mui/material/Fab";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import MoneyOffRoundedIcon from "@mui/icons-material/MoneyOffRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { formatBRL } from "@/lib/utils/currency";
import { calcSonhoMensal, formatDataAlvo, mesesRestantes } from "@/lib/utils/sonho";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { InsightCard } from "@/components/ui/InsightCard";
import { analyzeCompromissos } from "@/lib/insights/rules/compromissos";

interface Compromisso {
  id: string;
  nome: string;
  tipo: "DIVIDA" | "INVESTIMENTO" | "SONHO";
  valorMensal: string;
  metaTotal: string | null;
  dataAlvo: string | null; // ISO date string, e.g. "2027-12-01T00:00:00.000Z"
  ativo: boolean;
  notas: string | null;
}

const TIPO_CONFIG = {
  DIVIDA: {
    label: "Dívidas", itemLabel: "Dívida",
    color: "#f43f5e", bg: "#fff1f2", border: "#fecdd3", darkBg: "rgba(244,63,94,0.10)", darkBorder: "rgba(244,63,94,0.22)",
    tip: "Dívidas têm prioridade máxima — devem ser quitadas antes de investir ou sonhar.",
    emptyTitle: "Nenhuma dívida registrada",
    emptyMsg: "Ótimo! Sem dívidas cadastradas. Continue assim.",
  },
  INVESTIMENTO: {
    label: "Investimentos", itemLabel: "Investimento",
    color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", darkBg: "rgba(99,102,241,0.10)", darkBorder: "rgba(99,102,241,0.22)",
    tip: "Investimentos constroem seu patrimônio. Pague-se primeiro!",
    emptyTitle: "Sem investimentos ainda",
    emptyMsg: "Que tal começar com um aporte mensal? Pequenos valores fazem diferença.",
  },
  SONHO: {
    label: "Sonhos", itemLabel: "Sonho",
    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", darkBg: "rgba(245,158,11,0.10)", darkBorder: "rgba(245,158,11,0.22)",
    tip: "Reservas para objetivos específicos: viagem, carro, casa própria...",
    emptyTitle: "Nenhum sonho definido",
    emptyMsg: "Defina um objetivo e reserve um valor mensal para realizá-lo.",
  },
};

const VALOR_LABEL: Record<string, string> = {
  DIVIDA: "Parcela Mensal",
  INVESTIMENTO: "Aporte Mensal",
  SONHO: "Reserva Mensal",
};

const TOGGLE_LABELS: Record<string, { desativar: string; ativar: string }> = {
  DIVIDA:       { desativar: "Pausar pagamento",  ativar: "Retomar pagamento" },
  INVESTIMENTO: { desativar: "Pausar aporte",     ativar: "Retomar aporte" },
  SONHO:        { desativar: "Arquivar sonho",    ativar: "Reativar sonho" },
};

const TIPO_ICONS = {
  DIVIDA:       MoneyOffRoundedIcon,
  INVESTIMENTO: TrendingUpRoundedIcon,
  SONHO:        AutoAwesomeRoundedIcon,
};

export default function CompromissosPage() {
  const [items, setItems] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Compromisso | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"DIVIDA" | "INVESTIMENTO" | "SONHO">("DIVIDA");
  const [valorMensalCents, setValorMensalCents] = useState(0);
  const [metaTotalCents, setMetaTotalCents] = useState(0);
  const [dataAlvoForm, setDataAlvoForm] = useState(""); // YYYY-MM
  const [notas, setNotas] = useState("");

  const load = () => {
    fetch("/api/compromissos", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { setItems(res.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const saved = localStorage.getItem("compromissos_view_mode") as "list" | "grid" | null;
    if (saved) setViewMode(saved);
  }, []);

  const openNew = (t: "DIVIDA" | "INVESTIMENTO" | "SONHO" = "DIVIDA") => {
    setEditing(null);
    setNome(""); setTipo(t); setValorMensalCents(0); setMetaTotalCents(0); setDataAlvoForm(""); setNotas("");
    setDialogOpen(true);
  };

  const openEdit = (item: Compromisso) => {
    setEditing(item);
    setNome(item.nome);
    setTipo(item.tipo);
    setValorMensalCents(Math.round(parseFloat(item.valorMensal) * 100));
    setMetaTotalCents(item.metaTotal ? Math.round(parseFloat(item.metaTotal) * 100) : 0);
    setDataAlvoForm(item.dataAlvo ? item.dataAlvo.substring(0, 7) : "");
    setNotas(item.notas ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const isSonho = tipo === "SONHO";
    if (!nome.trim()) return;
    if (isSonho && (metaTotalCents === 0 || !dataAlvoForm)) return;
    if (!isSonho && valorMensalCents === 0) return;

    setSaving(true);
    const body = isSonho
      ? { nome: nome.trim(), tipo, metaTotal: metaTotalCents / 100, dataAlvo: dataAlvoForm, notas: notas.trim() || null }
      : { nome: nome.trim(), tipo, valorMensal: valorMensalCents / 100, notas: notas.trim() || null };

    if (editing) {
      await fetch(`/api/compromissos/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/compromissos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const handleToggleAtivo = async (item: Compromisso) => {
    await fetch(`/api/compromissos/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: !item.ativo }) });
    setMenuAnchor(null); setMenuItemId(null);
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
    await fetch(`/api/compromissos/${deleteDialogId}`, { method: "DELETE" });
    setDeletingId(null);
    setDeleteDialogId(null);
    load();
  };

  const handleViewMode = (_: React.MouseEvent, mode: "list" | "grid" | null) => {
    if (!mode) return;
    setViewMode(mode);
    localStorage.setItem("compromissos_view_mode", mode);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const menuItem = items.find((i) => i.id === menuItemId);

  const insights = useMemo(() => analyzeCompromissos(items, 0), [items]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AccountBalanceRoundedIcon sx={{ color: "#6366f1", fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Compromissos</Typography>
            <Typography variant="body2" color="text.secondary">{"Dívidas, investimentos e sonhos"}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewMode} size="small" sx={{ "& .MuiToggleButton-root": { border: "1px solid #e2e8f0", py: 0.5, px: 0.75 } }}>
            <ToggleButton value="list"><ViewListRoundedIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="grid"><ViewModuleRoundedIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openNew()} sx={{ borderRadius: 2, display: { xs: "none", md: "flex" } }}>
            Novo Compromisso
          </Button>
        </Box>
      </Box>

      {/* 3 métricas por tipo */}
      <Box data-tour="compromissos-metricas" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: { xs: 1, sm: 1.5 } }}>
        {(["DIVIDA", "INVESTIMENTO", "SONHO"] as const).map((tipoKey) => {
          const cfg = TIPO_CONFIG[tipoKey];
          const subtotal = items.filter((i) => i.tipo === tipoKey && i.ativo).reduce((acc, i) => acc + parseFloat(i.valorMensal), 0);
          return (
            <Card key={tipoKey} sx={{ border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`, borderTop: `3px solid ${cfg.color}`, bgcolor: isDark ? cfg.darkBg : cfg.bg }}>
              <CardContent sx={{ p: { xs: 1.25, sm: 1.75 }, "&:last-child": { pb: { xs: 1.25, sm: 1.75 } } }}>
                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cfg.color, mb: 0.25 }}>
                  {cfg.label}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: { xs: "0.9rem", sm: "1.2rem" }, color: cfg.color, lineHeight: 1.2 }}>
                  {formatBRL(subtotal)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>/mês</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Conteúdo principal */}
      <InsightCard insights={insights} loading={loading} />

      <Box data-tour="compromissos-lista">
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : viewMode === "grid" ? (
        /* ── Grid / Cockpit ── */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {(["DIVIDA", "INVESTIMENTO", "SONHO"] as const).map((tipoKey) => {
            const cfg = TIPO_CONFIG[tipoKey];
            const group = items.filter((i) => i.tipo === tipoKey);
            if (group.length === 0) return null;
            return (
              <Box key={tipoKey}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: cfg.color, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {cfg.label}
                  </Typography>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: isDark ? cfg.darkBorder : cfg.border }} />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 2 }}>
                  {group.map((item) => {
                    const valor = parseFloat(item.valorMensal);
                    return (
                      <Card key={item.id} sx={{ border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`, borderLeft: `4px solid ${cfg.color}`, bgcolor: isDark ? cfg.darkBg : cfg.bg, opacity: item.ativo ? 1 : 0.6 }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Chip
                              label={item.ativo ? "Ativo" : "Pausado"}
                              size="small"
                              sx={{ bgcolor: item.ativo ? "#dcfce7" : "#f1f5f9", color: item.ativo ? "#16a34a" : "#64748b", fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                            />
                            <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuItemId(item.id); }}>
                              <MoreVertRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{item.nome}</Typography>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1.75rem", color: cfg.color, lineHeight: 1 }}>
                              {formatBRL(valor)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">/{VALOR_LABEL[tipoKey].split(" ")[0].toLowerCase()}</Typography>
                          </Box>
                          <Box sx={{ height: "1px", bgcolor: isDark ? cfg.darkBorder : cfg.border }} />
                          {item.tipo === "SONHO" && item.metaTotal && item.dataAlvo ? (
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}>
                              <Box>
                                <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Meta total</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem", color: cfg.color }}>{formatBRL(parseFloat(item.metaTotal))}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Prazo</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem" }}>{formatDataAlvo(item.dataAlvo)}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>{mesesRestantes(item.dataAlvo, new Date())} meses</Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}>
                              <Box>
                                <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Anual</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem" }}>{formatBRL(valor * 12)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Tipo</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem" }}>{cfg.itemLabel}</Typography>
                              </Box>
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
              </Box>
            );
          })}
          {items.length === 0 && (
            <Card sx={{ border: isDark ? "2px dashed rgba(99,102,241,0.30)" : "2px dashed #c7d2fe", bgcolor: isDark ? "background.paper" : "#eef2ff" }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">Nenhum compromisso cadastrado.</Typography>
                <Button variant="outlined" onClick={() => openNew()} sx={{ mt: 2 }}>Cadastrar</Button>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        /* ── List view ── */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {(["DIVIDA", "INVESTIMENTO", "SONHO"] as const).map((tipoKey) => {
            const cfg = TIPO_CONFIG[tipoKey];
            const group = items.filter((i) => i.tipo === tipoKey);
            const subtotal = group.filter((i) => i.ativo).reduce((acc, i) => acc + parseFloat(i.valorMensal), 0);

            const groupContent = (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {group.length === 0 ? (
                  <Box sx={{ py: 2.5, px: 1, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: cfg.color, mb: 0.5 }}>{cfg.emptyTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">{cfg.emptyMsg}</Typography>
                  </Box>
                ) : (
                  group.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <Card key={item.id} sx={{ border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`, borderLeft: `4px solid ${cfg.color}`, bgcolor: item.ativo ? (isDark ? cfg.darkBg : cfg.bg) : (isDark ? "background.paper" : "white"), opacity: item.ativo ? 1 : 0.6, overflow: "hidden" }}>
                        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                          <Box
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, cursor: "pointer", userSelect: "none" }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{item.nome}</Typography>
                              {!isExpanded && item.notas && (
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>{item.notas}</Typography>
                              )}
                            </Box>
                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                              <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1rem", color: item.ativo ? cfg.color : "text.disabled", lineHeight: 1.2 }}>
                                {formatBRL(item.valorMensal)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>/{VALOR_LABEL[tipoKey].split(" ")[0].toLowerCase()}</Typography>
                            </Box>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuItemId(item.id); }} sx={{ flexShrink: 0 }}>
                              <MoreVertRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Collapse in={isExpanded}>
                            <Box sx={{ px: 2, pt: 1, pb: 1.5, borderTop: `1px solid ${isDark ? cfg.darkBorder : cfg.border}` }}>
                              {item.tipo === "SONHO" && item.metaTotal && item.dataAlvo ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                                    <Box>
                                      <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Meta total</Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.82rem", color: cfg.color }}>{formatBRL(parseFloat(item.metaTotal))}</Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Prazo</Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.82rem" }}>{formatDataAlvo(item.dataAlvo)} · {mesesRestantes(item.dataAlvo, new Date())} meses</Typography>
                                    </Box>
                                  </Box>
                                  {item.notas && (
                                    <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start", mt: 0.5 }}>
                                      <NotesRoundedIcon sx={{ fontSize: 13, color: "text.disabled", mt: "2px" }} />
                                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{item.notas}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              ) : item.notas ? (
                                <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
                                  <NotesRoundedIcon sx={{ fontSize: 13, color: "text.disabled", mt: "2px" }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{item.notas}</Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.disabled">Sem notas.</Typography>
                              )}
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                  <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => openNew(tipoKey)} sx={{ color: cfg.color, fontWeight: 600, "&:hover": { bgcolor: `${cfg.color}12` } }}>
                    Adicionar {cfg.itemLabel}
                  </Button>
                </Box>
              </Box>
            );

            return isMobile ? (
              <Accordion key={tipoKey} defaultExpanded sx={{ border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`, bgcolor: isDark ? cfg.darkBg : cfg.bg, borderRadius: "12px !important", "&:before": { display: "none" }, boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ borderRadius: 2, minHeight: "48px !important", "& .MuiAccordionSummary-content": { my: "10px !important" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: cfg.color, fontSize: "0.9rem" }}>{cfg.label}</Typography>
                    <Tooltip title={cfg.tip} arrow>
                      <InfoOutlinedIcon sx={{ fontSize: 14, color: cfg.color, opacity: 0.7 }} />
                    </Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "0.9rem", color: cfg.color, mr: 0.5 }}>
                      {formatBRL(subtotal)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 1 }}>{groupContent}</AccordionDetails>
              </Accordion>
            ) : (
              <Box key={tipoKey}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, mb: 1, borderRadius: 2, bgcolor: isDark ? cfg.darkBg : cfg.bg, border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`, borderLeft: `4px solid ${cfg.color}` }}>
                  <Typography sx={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
                  <Tooltip title={cfg.tip} arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 15, color: cfg.color, opacity: 0.7 }} />
                  </Tooltip>
                  <Box sx={{ flex: 1 }} />
                  <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "0.9rem", color: cfg.color }}>
                    {formatBRL(subtotal)}
                    <Typography component="span" variant="caption" color="text.secondary">/mês</Typography>
                  </Typography>
                </Box>
                {groupContent}
              </Box>
            );
          })}
        </Box>
      )}

      </Box>

      <Fab data-tour="compromissos-fab" color="primary" onClick={() => openNew()} sx={{ display: { xs: "flex", md: "none" }, position: "fixed", bottom: 80, right: 16, zIndex: 1200 }}>
        <AddRoundedIcon />
      </Fab>

      {/* ── Form Drawer ─────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" } } }}
      >
        {/* Colored header */}
        {(() => {
          const cfg = TIPO_CONFIG[tipo];
          const TipoIcon = TIPO_ICONS[tipo];
          return (
            <Box sx={{ background: `linear-gradient(135deg, ${cfg.color}ee 0%, ${cfg.color} 100%)`, px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
              <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
                  <TipoIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                    {editing ? `Editar ${cfg.itemLabel}` : `Novo ${cfg.itemLabel}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                    {cfg.tip}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })()}

        {/* Scrollable form body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Tipo selector */}
          {!editing ? (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", display: "block", mb: 1.5 }}>
                Tipo de compromisso
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
                {(["DIVIDA", "INVESTIMENTO", "SONHO"] as const).map((t) => {
                  const cfg = TIPO_CONFIG[t];
                  const TipoIcon = TIPO_ICONS[t];
                  const selected = tipo === t;
                  return (
                    <Box key={t} onClick={() => setTipo(t)} sx={{ p: 1.5, borderRadius: 2, textAlign: "center", cursor: "pointer", border: "2px solid", borderColor: selected ? cfg.color : "divider", bgcolor: selected ? cfg.bg : "background.paper", transition: "all 0.15s", "&:hover": { borderColor: cfg.color, bgcolor: cfg.bg } }}>
                      <TipoIcon sx={{ fontSize: 22, color: selected ? cfg.color : "text.disabled", display: "block", mx: "auto", mb: 0.5 }} />
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: selected ? cfg.color : "text.secondary", fontSize: "0.7rem", lineHeight: 1.2 }}>
                        {cfg.itemLabel}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: TIPO_CONFIG[tipo].bg, border: `1px solid ${TIPO_CONFIG[tipo].border}`, borderRadius: 2 }}>
              {(() => { const TipoIcon = TIPO_ICONS[tipo]; return <TipoIcon sx={{ color: TIPO_CONFIG[tipo].color, fontSize: 20, flexShrink: 0 }} />; })()}
              <Box>
                <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1 }}>Tipo (não pode ser alterado)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: TIPO_CONFIG[tipo].color }}>{TIPO_CONFIG[tipo].itemLabel}</Typography>
              </Box>
            </Box>
          )}

          <Divider />

          {/* Nome */}
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            required
            autoFocus={!editing}
            placeholder="Ex: Financiamento carro, Nubank Platinum..."
            helperText="Como você identifica esse compromisso"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />

          {/* Valor — condicional por tipo */}
          {tipo !== "SONHO" ? (
            <CurrencyInput
              label={VALOR_LABEL[tipo]}
              valueCents={valorMensalCents}
              onValueChange={setValorMensalCents}
              fullWidth
              required
              helperText={
                tipo === "DIVIDA" ? "Valor da parcela ou mínimo mensal a pagar" :
                "Quanto você aporta por mês nesse investimento"
              }
            />
          ) : (
            /* ── Campos exclusivos de SONHO ── */
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <CurrencyInput
                label="Meta Total"
                valueCents={metaTotalCents}
                onValueChange={setMetaTotalCents}
                fullWidth
                required
                helperText="Valor total que você quer acumular para realizar este sonho"
              />

              <TextField
                label="Quando você quer realizar?"
                type="month"
                value={dataAlvoForm}
                onChange={(e) => setDataAlvoForm(e.target.value)}
                fullWidth
                required
                helperText="Mês e ano alvo"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                    inputProps: {
                      min: (() => {
                        const d = new Date();
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      })(),
                    },
                  },
                }}
              />

              {/* Cálculo da reserva mensal */}
              {metaTotalCents > 0 && dataAlvoForm && (() => {
                const mensal = calcSonhoMensal(metaTotalCents / 100, dataAlvoForm, new Date());
                const meses = mesesRestantes(dataAlvoForm, new Date());
                return (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? "rgba(245,158,11,0.10)" : "#fffbeb", border: "1px solid", borderColor: isDark ? "rgba(245,158,11,0.25)" : "#fde68a" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <SavingsRoundedIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Reserva mensal calculada
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1.5rem", color: "#f59e0b", lineHeight: 1.2 }}>
                      {formatBRL(mensal)}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>/mês</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {meses} {meses === 1 ? "mês" : "meses"} para realizar · meta: {formatBRL(metaTotalCents / 100)}
                    </Typography>
                  </Box>
                );
              })()}
            </Box>
          )}

          <Divider />

          {/* Notas */}
          <TextField
            label="Observações (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder={
              tipo === "DIVIDA" ? "Taxa de juros, banco, nº do contrato..." :
              tipo === "INVESTIMENTO" ? "Corretora, tipo de ativo, meta de saldo..." :
              "Viagem dos sonhos, carro, casa própria... conte mais sobre esse objetivo!"
            }
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
            disabled={saving || !nome.trim() || (tipo === "SONHO" ? (metaTotalCents === 0 || !dataAlvoForm) : valorMensalCents === 0)}
            sx={{ bgcolor: TIPO_CONFIG[tipo].color, "&:hover": { bgcolor: TIPO_CONFIG[tipo].color, filter: "brightness(0.9)" } }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>

      {/* MoreVert menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuItemId(null); }}
        slotProps={{ paper: { elevation: 3, sx: { borderRadius: 2, minWidth: 190 } } }}
      >
        <MenuItem onClick={() => { if (menuItem) openEdit(menuItem); setMenuAnchor(null); }}>
          <EditRoundedIcon sx={{ fontSize: 16, mr: 1.5, color: "text.secondary" }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => { if (menuItem) handleToggleAtivo(menuItem); }}>
          {menuItem ? (menuItem.ativo ? TOGGLE_LABELS[menuItem.tipo].desativar : TOGGLE_LABELS[menuItem.tipo].ativar) : ""}
        </MenuItem>
        <MenuItem onClick={() => { if (menuItemId) handleDelete(menuItemId); }} sx={{ color: "error.main" }}>
          <DeleteRoundedIcon sx={{ fontSize: 16, mr: 1.5 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Delete dialog */}
      <Dialog open={Boolean(deleteDialogId)} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir compromisso?</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{items.find((i) => i.id === deleteDialogId)?.nome}</strong>? {"Essa ação não pode ser desfeita."}
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

