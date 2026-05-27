"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { CartaoCard } from "@/components/cartoes/CartaoCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { analyzeCartoes } from "@/lib/insights/rules/cartoes";
import { usePageTour } from "@/components/tour/usePageTour";
import { cartoesSteps } from "@/components/tour/steps/cartoes.steps";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatBRL } from "@/lib/utils/currency";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

interface Cartao {
  id: string;
  nome: string;
  limite: number;
  diaVencimento: number;
  cor: string | null;
  ativo: boolean;
  faturaMesAtual: number;
}

const COR_PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f59e0b", "#22c55e", "#06b6d4", "#64748b",
];

const EMPTY_FORM = { nome: "", limiteCents: 0, diaVencimento: "1", cor: COR_PALETTE[0] };

export default function CartoesPage() {
  usePageTour(cartoesSteps);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const router = useRouter();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCartao, setEditCartao] = useState<Cartao | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cartao | null>(null);

  async function loadCartoes() {
    setLoading(true);
    const res = await fetch("/api/cartoes");
    const json = await res.json();
    if (json.success) setCartoes(json.data);
    setLoading(false);
  }

  useEffect(() => { loadCartoes(); }, []);

  function openCreate() {
    setEditCartao(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(c: Cartao) {
    setEditCartao(c);
    setForm({ nome: c.nome, limiteCents: Math.round(c.limite * 100), diaVencimento: String(c.diaVencimento), cor: c.cor ?? COR_PALETTE[0] });
    setDrawerOpen(true);
  }

  async function handleSave() {
    const body = {
      nome: form.nome.trim(),
      limite: form.limiteCents / 100,
      diaVencimento: parseInt(form.diaVencimento) || 1,
      cor: form.cor,
    };
    setSaving(true);
    if (editCartao) {
      await fetch(`/api/cartoes/${editCartao.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/cartoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setDrawerOpen(false);
    loadCartoes();
  }

  function openDelete(c: Cartao) {
    setDeleteTarget(c);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/cartoes/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    loadCartoes();
  }

  const totalFatura = cartoes.reduce((s, c) => s + c.faturaMesAtual, 0);
  const totalLimite = cartoes.reduce((s, c) => s + c.limite, 0);
  const pctGlobal = totalLimite > 0 ? Math.min((totalFatura / totalLimite) * 100, 100) : 0;
  const pctColor = pctGlobal >= 90 ? "#ef4444" : pctGlobal >= 70 ? "#f59e0b" : "#22c55e";
  const cartoesSorted = [...cartoes].sort((a, b) => Number(b.ativo) - Number(a.ativo));

  const insights = useMemo(() => analyzeCartoes(cartoes, null), [cartoes]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 10, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Cartões de Crédito</Typography>
      </Box>

      {/* Summary banner */}
      {!loading && cartoes.length > 0 && (
        <Box data-tour="cartoes-summary-banner" sx={{ mb: 3, p: 2.5, borderRadius: "16px", background: "linear-gradient(135deg, #1e1e3a 0%, #16213e 100%)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", mb: 0.3 }}>Fatura total ({cartoes.length} cartão{cartoes.length > 1 ? "es" : ""})</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", color: pctColor, lineHeight: 1.2 }}>{formatBRL(totalFatura)}</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", mb: 0.3 }}>Limite total</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2, color: "rgba(255,255,255,0.9)" }}>{formatBRL(totalLimite)}</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 100 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", mb: 0.3 }}>Uso global</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: pctColor, lineHeight: 1.2 }}>{pctGlobal.toFixed(0)}%</Typography>
            <Box sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${pctGlobal}%`, bgcolor: pctColor, borderRadius: 2 }} />
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <InsightCard insights={insights} loading={loading} />
      </Box>

      {/* Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}><Skeleton variant="rounded" height={160} sx={{ borderRadius: "16px" }} /></Grid>)}
        </Grid>
      ) : cartoes.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          <CreditCardRoundedIcon sx={{ fontSize: 56, mb: 1, opacity: 0.3 }} />
          <Typography>Nenhum cartão cadastrado</Typography>
          <Typography variant="body2">Clique em + para adicionar</Typography>
        </Box>
      ) : (
        <Grid data-tour="cartoes-grid" container spacing={2}>
          {cartoesSorted.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CartaoCard
                cartao={c}
                onEdit={() => openEdit(c)}
                onDelete={() => openDelete(c)}
                onClick={() => router.push(`/cartoes/${c.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* FAB */}
      <Fab
        data-tour="cartoes-fab"
        color="primary"
        sx={{ position: "fixed", bottom: { xs: 72, md: 24 }, right: 24 }}
        onClick={openCreate}
      >
        <AddRoundedIcon />
      </Fab>

      {/* ── Cartão Form Drawer ─────────────────────────────────────────── */}
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: 1500 }}
        slotProps={{ paper: { sx: { width: { sm: 480 }, height: { xs: "92dvh", sm: "100%" }, borderRadius: { xs: "20px 20px 0 0", sm: 0 }, display: "flex", flexDirection: "column" } } }}
      >
        {/* Colored header */}
        <Box sx={{ background: `linear-gradient(135deg, ${form.cor}ee 0%, ${form.cor} 100%)`, px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
          <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
            <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
              <CreditCardRoundedIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                {editCartao ? "Editar Cartão" : "Novo Cartão"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                {editCartao ? "Atualize os dados do seu cartão" : "Adicione um novo cartão de crédito"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Identificação */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
              Identificação
            </Typography>
            <TextField
              label="Nome do cartão"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth
              required
              autoFocus={!editCartao}
              placeholder="Ex: Nubank, Itaú Gold, C6 Black..."
              helperText="Como você identifica esse cartão"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
            />
          </Box>

          <Divider />

          {/* Limite e vencimento */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
              Limite e Vencimento
            </Typography>
            <CurrencyInput
              label="Limite do cartão"
              valueCents={form.limiteCents}
              onValueChange={(c) => setForm((f) => ({ ...f, limiteCents: c }))}
              fullWidth
              required
              helperText="Limite total de crédito disponível"
            />
            <TextField
              label="Dia de vencimento"
              type="number"
              value={form.diaVencimento}
              onChange={(e) => setForm((f) => ({ ...f, diaVencimento: e.target.value }))}
              fullWidth
              helperText="Dia do mês em que a fatura vence (1–31)"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><CalendarTodayRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment>, inputProps: { min: 1, max: 31 } }, inputLabel: { shrink: true } }}
            />
          </Box>

          <Divider />

          {/* Cor */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", display: "block", mb: 1.5 }}>
              Cor do cartão
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {COR_PALETTE.map((cor) => (
                <Box
                  key={cor}
                  onClick={() => setForm((f) => ({ ...f, cor }))}
                  sx={{
                    width: 36, height: 36, borderRadius: "50%", bgcolor: cor, cursor: "pointer",
                    border: form.cor === cor ? "3px solid white" : "3px solid transparent",
                    boxShadow: form.cor === cor ? `0 0 0 2px ${cor}` : "none",
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, pt: 2, pb: "max(16px, env(safe-area-inset-bottom))", borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.nome.trim() || form.limiteCents === 0}
            sx={{ bgcolor: form.cor, "&:hover": { bgcolor: form.cor, filter: "brightness(0.9)" } }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>

      {/* Delete confirm */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir cartão?</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Todas as assinaturas, parcelamentos e lançamentos vinculados serão excluídos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
