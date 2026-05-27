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
import FormControlLabel from "@mui/material/FormControlLabel";
import Fab from "@mui/material/Fab";
import Collapse from "@mui/material/Collapse";
import Menu from "@mui/material/Menu";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import { formatBRL } from "@/lib/utils/currency";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { InsightCard } from "@/components/ui/InsightCard";
import { analyzeEntradas } from "@/lib/insights/rules/entradas";
import { usePageTour } from "@/components/tour/usePageTour";
import { entradasSteps } from "@/components/tour/steps/entradas.steps";

interface Entrada {
  id: string;
  nome: string;
  tipo: "FIXA" | "VARIAVEL";
  valor: string;
  ativo: boolean;
  notas: string | null;
}

const TIPO_CONFIG = {
  FIXA:     { label: "Fixa",     color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0", darkBg: "rgba(16,185,129,0.10)", darkBorder: "rgba(16,185,129,0.22)" },
  VARIAVEL: { label: "Variável", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", darkBg: "rgba(59,130,246,0.10)", darkBorder: "rgba(59,130,246,0.22)" },
};
const STATUS_CONFIG = {
  ativo:   { label: "Ativa",   color: "#16a34a", bg: "#dcfce7", darkBg: "rgba(22,163,74,0.12)" },
  inativo: { label: "Inativa", color: "#64748b", bg: "#f1f5f9", darkBg: "rgba(100,116,139,0.12)" },
};

const TIPO_ICONS_ENTRADA = {
  FIXA:     RepeatRoundedIcon,
  VARIAVEL: SwapVertRoundedIcon,
};
const TIPO_DESCS_ENTRADA = {
  FIXA:     "Valor previsível todo mês — salário, aluguel recebido, pensão...",
  VARIAVEL: "Valor oscila mês a mês — freela, comissão, dividendos, bônus...",
};

export default function EntradasPage() {
  usePageTour(entradasSteps);

  const [items, setItems] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Entrada | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"FIXA" | "VARIAVEL">("FIXA");
  const [valorCents, setValorCents] = useState(0);
  const [notas, setNotas] = useState("");

  const load = () => {
    fetch("/api/entradas", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { setItems(res.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const saved = localStorage.getItem("entradas_view_mode") as "list" | "grid" | null;
    if (saved) setViewMode(saved);
  }, []);

  const openNew = () => {
    setEditing(null);
    setNome(""); setTipo("FIXA"); setValorCents(0); setNotas("");
    setDialogOpen(true);
  };

  const openEdit = (item: Entrada) => {
    setEditing(item);
    setNome(item.nome); setTipo(item.tipo); setValorCents(Math.round(parseFloat(item.valor) * 100)); setNotas(item.notas ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || valorCents === 0) return;
    setSaving(true);
    const body = { nome: nome.trim(), tipo, valor: valorCents / 100, notas: notas.trim() || null };
    if (editing) {
      await fetch(`/api/entradas/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/entradas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const handleToggleAtivo = async (item: Entrada) => {
    await fetch(`/api/entradas/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: !item.ativo }) });
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
    await fetch(`/api/entradas/${deleteDialogId}`, { method: "DELETE" });
    setDeletingId(null);
    setDeleteDialogId(null);
    load();
  };

  const handleViewMode = (_: React.MouseEvent, mode: "list" | "grid" | null) => {
    if (!mode) return;
    setViewMode(mode);
    localStorage.setItem("entradas_view_mode", mode);
  };

  const total = items.filter((i) => i.ativo).reduce((acc, i) => acc + parseFloat(i.valor), 0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const insights = useMemo(() => analyzeEntradas(items, total), [items, total]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TrendingUpRoundedIcon sx={{ color: "#10b981", fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Entradas</Typography>
            <Typography variant="body2" color="text.secondary">Suas fontes de renda mensais</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewMode} size="small" sx={{ "& .MuiToggleButton-root": { border: "1px solid #e2e8f0", py: 0.5, px: 0.75 } }}>
            <ToggleButton value="list"><ViewListRoundedIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="grid"><ViewModuleRoundedIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew} sx={{ borderRadius: 2, display: { xs: "none", md: "flex" }, bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}>
            Nova Entrada
          </Button>
        </Box>
      </Box>

      <Card data-tour="entradas-total-card" sx={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.75)" }}>
            Total Mensal Ativo
          </Typography>
          <Typography sx={{ fontSize: "2rem", fontWeight: 900, fontFamily: "monospace", letterSpacing: "-0.03em", mt: 0.5 }}>
            {formatBRL(total)}
          </Typography>
        </CardContent>
      </Card>

      <InsightCard insights={insights} loading={loading} />

      <Box data-tour="entradas-list">
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : items.length === 0 ? (
        <Card sx={{ border: isDark ? "2px dashed rgba(16,185,129,0.30)" : "2px dashed #a7f3d0", bgcolor: isDark ? "rgba(16,185,129,0.05)" : "#f0fdf4" }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">Nenhuma entrada cadastrada ainda.</Typography>
            <Button variant="outlined" onClick={openNew} sx={{ mt: 2 }}>Cadastrar primeira entrada</Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 2 }}>
          {items.map((item) => {
            const tc = TIPO_CONFIG[item.tipo];
            const sc = item.ativo ? STATUS_CONFIG.ativo : STATUS_CONFIG.inativo;
            const valor = parseFloat(item.valor);
            return (
              <Card key={item.id} sx={{ border: `1px solid ${isDark ? tc.darkBorder : tc.border}`, borderLeft: `4px solid ${tc.color}`, bgcolor: isDark ? tc.darkBg : tc.bg, opacity: item.ativo ? 1 : 0.6 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Chip label={sc.label} size="small" sx={{ bgcolor: isDark ? sc.darkBg : sc.bg, color: sc.color, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                    <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuItemId(item.id); }}>
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{item.nome}</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1.75rem", color: tc.color, lineHeight: 1 }}>
                      {formatBRL(valor)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">/mês</Typography>
                  </Box>
                  <Box sx={{ height: "1px", bgcolor: isDark ? tc.darkBorder : tc.border }} />
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Anual</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem" }}>{formatBRL(valor * 12)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: "block", lineHeight: 1.3 }}>Tipo</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.4, fontSize: "0.78rem" }}>{tc.label}</Typography>
                    </Box>
                  </Box>
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
          {items.map((item) => {
            const tc = TIPO_CONFIG[item.tipo];
            const sc = item.ativo ? STATUS_CONFIG.ativo : STATUS_CONFIG.inativo;
            const isExpanded = expandedId === item.id;
            return (
              <Card key={item.id} sx={{ border: `1px solid ${isDark ? tc.darkBorder : tc.border}`, borderLeft: `4px solid ${tc.color}`, bgcolor: isDark ? tc.darkBg : tc.bg, opacity: item.ativo ? 1 : 0.6, overflow: "hidden" }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Box
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, cursor: "pointer", userSelect: "none" }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{item.nome}</Typography>
                        <Chip label={tc.label} size="small" sx={{ bgcolor: `${tc.color}20`, color: tc.color, fontWeight: 700, fontSize: "0.65rem", height: 20, flexShrink: 0 }} />
                        <Chip label={sc.label} size="small" sx={{ bgcolor: isDark ? sc.darkBg : sc.bg, color: sc.color, fontWeight: 700, fontSize: "0.65rem", height: 20, flexShrink: 0 }} />
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontFamily: "monospace", fontSize: "1.1rem", color: tc.color, flexShrink: 0 }}>
                      {formatBRL(item.valor)}
                      <Typography component="span" variant="caption" color="text.secondary">/mês</Typography>
                    </Typography>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuItemId(item.id); }} sx={{ flexShrink: 0 }}>
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2, pt: 1, pb: 1.5, borderTop: `1px solid ${isDark ? tc.darkBorder : tc.border}` }}>
                      {item.notas ? (
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
          })}
        </Box>
      )}

      </Box>

      <Fab data-tour="entradas-fab" color="primary" onClick={openNew} sx={{ display: { xs: "flex", md: "none" }, position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom))", right: 16, zIndex: 1200 }}>
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
          const TipoIcon = TIPO_ICONS_ENTRADA[tipo];
          const title = editing ? "Editar Entrada" : "Nova Entrada";
          return (
            <Box sx={{ background: `linear-gradient(135deg, ${cfg.color}ee 0%, ${cfg.color} 100%)`, px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
              <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>{title}</Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                    {TIPO_DESCS_ENTRADA[tipo]}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })()}

        {/* Scrollable form body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Tipo selector */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", display: "block", mb: 1.5 }}>
              Tipo de renda
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {(["FIXA", "VARIAVEL"] as const).map((t) => {
                const cfg = TIPO_CONFIG[t];
                const TipoIcon = TIPO_ICONS_ENTRADA[t];
                const selected = tipo === t;
                return (
                  <Box key={t} onClick={() => setTipo(t)} sx={{ p: 2, borderRadius: 2, cursor: "pointer", border: "2px solid", borderColor: selected ? cfg.color : "divider", bgcolor: selected ? cfg.bg : "background.paper", transition: "all 0.15s", "&:hover": { borderColor: cfg.color, bgcolor: cfg.bg } }}>
                    <TipoIcon sx={{ fontSize: 24, color: selected ? cfg.color : "text.disabled", display: "block", mb: 0.75 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: selected ? cfg.color : "text.secondary" }}>{cfg.label}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.3, display: "block", mt: 0.25 }}>{TIPO_DESCS_ENTRADA[t]}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Divider />

          {/* Nome */}
          <TextField
            label="Nome da renda"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            required
            autoFocus={!editing}
            placeholder="Ex: Salário CLT, Freela Design, Aluguel..."
            helperText="Como você identifica essa fonte de renda"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />

          {/* Valor */}
          <CurrencyInput
            label="Valor Mensal"
            valueCents={valorCents}
            onValueChange={setValorCents}
            fullWidth
            required
            helperText={tipo === "VARIAVEL" ? "Use a média dos últimos 3 meses para renda variável" : "Valor líquido que entra na sua conta todo mês"}
          />

          <Divider />

          {/* Notas */}
          <TextField
            label="Observações (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Empresa, contrato, forma de pagamento..."
            helperText="Anotações extras sobre essa renda"
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><NotesRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />
        </Box>

        {/* Fixed footer */}
        <Box sx={{ px: 3, pt: 2, pb: "max(16px, env(safe-area-inset-bottom))", borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving || !nome.trim() || valorCents === 0}
            sx={{ bgcolor: TIPO_CONFIG[tipo].color, "&:hover": { bgcolor: TIPO_CONFIG[tipo].color, filter: "brightness(0.9)" } }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuItemId(null); }}
        slotProps={{ paper: { elevation: 3, sx: { borderRadius: 2, minWidth: 160 } } }}
      >
        <MenuItem onClick={() => { const g = items.find((i) => i.id === menuItemId); if (g) openEdit(g); setMenuAnchor(null); }}>
          <EditRoundedIcon sx={{ fontSize: 16, mr: 1.5, color: "text.secondary" }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => { const g = items.find((i) => i.id === menuItemId); if (g) handleToggleAtivo(g); setMenuAnchor(null); setMenuItemId(null); }}>
          {items.find((i) => i.id === menuItemId)?.ativo ? "Desativar" : "Ativar"}
        </MenuItem>
        <MenuItem onClick={() => { if (menuItemId) handleDelete(menuItemId); }} sx={{ color: "error.main" }}>
          <DeleteRoundedIcon sx={{ fontSize: 16, mr: 1.5 }} />
          Excluir
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(deleteDialogId)} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir entrada?</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{items.find((i) => i.id === deleteDialogId)?.nome}</strong>? Essa ação não pode ser desfeita.
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
