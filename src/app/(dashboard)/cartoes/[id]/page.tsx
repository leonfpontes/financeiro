"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import Checkbox from "@mui/material/Checkbox";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { FaturaChart } from "@/components/cartoes/FaturaChart";
import { ParcelamentoListItem } from "@/components/cartoes/ParcelamentoListItem";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatBRL } from "@/lib/utils/currency";
import { formatMesAno } from "@/lib/utils/date";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Cartao { id: string; nome: string; limite: number; cor: string | null; diaVencimento: number; ativo: boolean; faturaMesAtual: number; }
interface Assinatura { id: string; nome: string; valor: number; dataInicio: string; dataFim: string | null; notas?: string | null; }
interface Parcelamento { id: string; nome: string; valorTotal: number; numeroParcelas: number; mesInicio: string; valorParcela: number; parcelaAtual: number; mesFim: string; notas?: string | null; }
interface Avulso { id: string; nome: string; valor: number; mesAno: string; notas?: string | null; }
interface FaturaData {
  fatura: {
    assinaturas: Assinatura[];
    parcelamentos: Parcelamento[];
    avulsos: Avulso[];
    totalAssinaturas: number;
    totalParcelamentos: number;
    totalAvulsos: number;
    total: number;
  };
  historico: Array<{ mesAno: string; total: number }>;
  regressao: { insufficient: boolean; forecast: Array<{ mesAno: string; valor: number }> };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function currentMesAno(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(mesAno: string, n: number): string {
  const [y, m] = mesAno.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMesLabel(mesAno: string): string {
  const [y, m] = mesAno.split("-");
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[Number(m) - 1]} ${y}`;
}

function getCreateFabLabel(tab: number): string {
  if (tab === 1) return "Nova assinatura";
  if (tab === 2) return "Novo parcelamento";
  return "Novo avulso";
}

function getCreateFabColor(tab: number, corCartao: string): string {
  if (tab === 1) return "#8b5cf6";
  if (tab === 2) return "#f59e0b";
  return corCartao;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CartaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [cartao, setCartao] = useState<Cartao | null>(null);
  const [tab, setTab] = useState(0);
  const [mesAno, setMesAno] = useState(currentMesAno());
  const [faturaData, setFaturaData] = useState<FaturaData | null>(null);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [parcelamentos, setParcelamentos] = useState<Parcelamento[]>([]);
  const [loadingFatura, setLoadingFatura] = useState(true);

  // Drawer states
  const [assinaturaDrawer, setAssinaturaDrawer] = useState<{ open: boolean; edit: Assinatura | null }>({ open: false, edit: null });
  const [assinaturaForm, setAssinaturaForm] = useState({ nome: "", dataInicio: currentMesAno(), dataFim: "", notas: "" });
  const [assinaturaValorCents, setAssinaturaValorCents] = useState(0);
  const [parcelamentoDrawer, setParcelamentoDrawer] = useState<{ open: boolean; edit: Parcelamento | null }>({ open: false, edit: null });
  const [parcelamentoForm, setParcelamentoForm] = useState({ nome: "", numeroParcelas: "12", mesInicio: currentMesAno(), notas: "" });
  const [parcelamentoValorTotalCents, setParcelamentoValorTotalCents] = useState(0);
  const [avulsoDrawer, setAvulsoDrawer] = useState<{ open: boolean; edit: Avulso | null }>({ open: false, edit: null });
  const [avulsoForm, setAvulsoForm] = useState({ nome: "", notas: "" });
  const [avulsoValorCents, setAvulsoValorCents] = useState(0);
  const [cancelarDialog, setCancelarDialog] = useState<{ open: boolean; assinatura: Assinatura | null }>({ open: false, assinatura: null });
  const [cancelarDataFim, setCancelarDataFim] = useState(currentMesAno());
  const [saving, setSaving] = useState(false);

  // Pagamento
  const [pagamento, setPagamento] = useState<{ pago: boolean; dataPagamento: string | null }>({ pago: false, dataPagamento: null });
  const [savingPagamento, setSavingPagamento] = useState(false);

  async function loadPagamento() {
    const r = await fetch(`/api/cartoes/${id}/pagamento?mesAno=${mesAno}`);
    const j = await r.json();
    if (j.success) setPagamento(j.data);
  }

  async function togglePagamento(pago: boolean, dataPagamento: string | null) {
    setSavingPagamento(true);
    const r = await fetch(`/api/cartoes/${id}/pagamento`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAno, pago, dataPagamento }),
    });
    const j = await r.json();
    if (j.success) setPagamento(j.data);
    setSavingPagamento(false);
  }

  // Load card
  useEffect(() => {
    fetch(`/api/cartoes/${id}`).then((r) => r.json()).then((j) => { if (j.success) setCartao(j.data); });
  }, [id]);

  // Load fatura
  async function loadFatura() {
    setLoadingFatura(true);
    const r = await fetch(`/api/cartoes/${id}/fatura?mesAno=${mesAno}`);
    const j = await r.json();
    if (j.success) setFaturaData(j.data);
    setLoadingFatura(false);
  }

  // Load assinaturas & parcelamentos (all, not month-filtered)
  async function loadAssinaturas() {
    const r = await fetch(`/api/cartoes/${id}/assinaturas`);
    const j = await r.json();
    if (j.success) setAssinaturas(j.data);
  }
  async function loadParcelamentos() {
    const r = await fetch(`/api/cartoes/${id}/parcelamentos`);
    const j = await r.json();
    if (j.success) setParcelamentos(j.data);
  }

  useEffect(() => { loadFatura(); }, [id, mesAno]);
  useEffect(() => { loadAssinaturas(); }, [id]);
  useEffect(() => { loadParcelamentos(); }, [id]);
  useEffect(() => { loadPagamento(); }, [id, mesAno]);

  // ── Assinatura CRUD ──
  async function saveAssinatura() {
    setSaving(true);
    const body = {
      nome: assinaturaForm.nome,
      valor: assinaturaValorCents / 100,
      dataInicio: assinaturaForm.dataInicio,
      ...(assinaturaForm.dataFim ? { dataFim: assinaturaForm.dataFim } : {}),
      ...(assinaturaForm.notas ? { notas: assinaturaForm.notas } : {}),
    };
    if (assinaturaDrawer.edit) {
      await fetch(`/api/cartoes/${id}/assinaturas/${assinaturaDrawer.edit.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch(`/api/cartoes/${id}/assinaturas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setAssinaturaDrawer({ open: false, edit: null });
    loadAssinaturas();
    loadFatura();
  }
  async function deleteAssinatura(aid: string) {
    await fetch(`/api/cartoes/${id}/assinaturas/${aid}`, { method: "DELETE" });
    loadAssinaturas();
    loadFatura();
  }
  async function cancelarAssinatura() {
    if (!cancelarDialog.assinatura) return;
    await fetch(`/api/cartoes/${id}/assinaturas/${cancelarDialog.assinatura.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancelar", dataFim: cancelarDataFim }) });
    setCancelarDialog({ open: false, assinatura: null });
    loadAssinaturas();
    loadFatura();
  }

  // ── Parcelamento CRUD ──
  async function saveParcelamento() {
    setSaving(true);
    const body = {
      nome: parcelamentoForm.nome,
      valorTotal: parcelamentoValorTotalCents / 100,
      numeroParcelas: parseInt(parcelamentoForm.numeroParcelas),
      mesInicio: parcelamentoForm.mesInicio,
      ...(parcelamentoForm.notas ? { notas: parcelamentoForm.notas } : {}),
    };
    if (parcelamentoDrawer.edit) {
      await fetch(`/api/cartoes/${id}/parcelamentos/${parcelamentoDrawer.edit.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch(`/api/cartoes/${id}/parcelamentos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setParcelamentoDrawer({ open: false, edit: null });
    loadParcelamentos();
    loadFatura();
  }
  async function deleteParcelamento(pid: string) {
    await fetch(`/api/cartoes/${id}/parcelamentos/${pid}`, { method: "DELETE" });
    loadParcelamentos();
    loadFatura();
  }

  // ── Avulso CRUD ──
  async function saveAvulso() {
    setSaving(true);
    const body = {
      nome: avulsoForm.nome,
      valor: avulsoValorCents / 100,
      mesAno,
      ...(avulsoForm.notas ? { notas: avulsoForm.notas } : {}),
    };
    if (avulsoDrawer.edit) {
      await fetch(`/api/cartoes/${id}/avulsos/${avulsoDrawer.edit.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch(`/api/cartoes/${id}/avulsos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setAvulsoDrawer({ open: false, edit: null });
    loadFatura();
  }
  async function deleteAvulso(avid: string) {
    await fetch(`/api/cartoes/${id}/avulsos/${avid}`, { method: "DELETE" });
    loadFatura();
  }

  function openCreateDrawerForCurrentTab() {
    if (tab === 1) {
      setAssinaturaDrawer({ open: true, edit: null });
      setAssinaturaForm({ nome: "", dataInicio: currentMesAno(), dataFim: "", notas: "" });
      setAssinaturaValorCents(0);
      return;
    }

    if (tab === 2) {
      setParcelamentoDrawer({ open: true, edit: null });
      setParcelamentoForm({ nome: "", numeroParcelas: "12", mesInicio: currentMesAno(), notas: "" });
      setParcelamentoValorTotalCents(0);
      return;
    }

    if (tab === 3) {
      setAvulsoDrawer({ open: true, edit: null });
      setAvulsoForm({ nome: "", notas: "" });
      setAvulsoValorCents(0);
    }
  }

  if (!cartao) return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4, mb: 2 }} />
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
    </Box>
  );

  const cor = cartao.cor ?? "#6366f1";

  return (
    <Box sx={{ pb: { xs: 10, md: 3 } }}>
      {/* Header */}
      <Box sx={{ background: `linear-gradient(135deg, ${cor}22 0%, transparent 100%)`, borderBottom: "1px solid rgba(255,255,255,0.06)", p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <IconButton size="small" onClick={() => router.push("/cartoes")} sx={{ color: "text.secondary" }}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{cartao.nome}</Typography>
        </Box>

        {/* Month selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 4 }}>
          <IconButton size="small" onClick={() => setMesAno((m) => addMonths(m, -1))} sx={{ color: "text.secondary" }}>
            <ChevronLeftRoundedIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 600, minWidth: 100, textAlign: "center" }}>{formatMesLabel(mesAno)}</Typography>
          <IconButton size="small" onClick={() => setMesAno((m) => addMonths(m, 1))} sx={{ color: "text.secondary" }}>
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>

        {/* Fatura totals — 3 metrics */}
        {faturaData && (() => {
          const disponivel = cartao.limite - faturaData.fatura.total;
          const usoPercent = cartao.limite > 0 ? Math.min((faturaData.fatura.total / cartao.limite) * 100, 100) : 0;
          const dispColor = disponivel < 0 ? "#ef4444" : disponivel < cartao.limite * 0.15 ? "#f59e0b" : "#22c55e";
          return (
            <Box sx={{ ml: 4, mt: 1.5, display: "flex", gap: { xs: 2.5, sm: 4 }, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Total da fatura</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color: cor, lineHeight: 1.2 }}>{formatBRL(faturaData.fatura.total)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Disponível</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color: dispColor, lineHeight: 1.2 }}>{formatBRL(disponivel)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Vencimento</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem", lineHeight: 1.2, mt: 0.3 }}>Dia {cartao.diaVencimento}</Typography>
              </Box>
              <Box sx={{ minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary">Uso do limite</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.2, mt: 0.3 }}>{usoPercent.toFixed(0)}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={usoPercent}
                  sx={{
                    mt: 0.7,
                    height: 6,
                    borderRadius: 99,
                    bgcolor: "rgba(15,23,42,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 99,
                      bgcolor: usoPercent >= 90 ? "#ef4444" : usoPercent >= 70 ? "#f59e0b" : cor,
                    },
                  }}
                />
              </Box>
              {/* Pagamento */}
              <Box sx={{ ml: { xs: 0, sm: "auto" }, display: "flex", alignItems: "center", gap: 1, pl: { sm: 2 }, borderLeft: { sm: "1px solid rgba(0,0,0,0.08)" } }}>
                <Checkbox
                  checked={pagamento.pago}
                  disabled={savingPagamento}
                  onChange={(e) => {
                    const pago = e.target.checked;
                    const data = pago ? (new Date().toISOString().slice(0, 10)) : null;
                    togglePagamento(pago, data);
                  }}
                  icon={<RadioButtonUncheckedRoundedIcon sx={{ fontSize: 22 }} />}
                  checkedIcon={<CheckCircleRoundedIcon sx={{ color: "#22c55e", fontSize: 22 }} />}
                  sx={{ p: 0.5 }}
                />
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: pagamento.pago ? "#22c55e" : "text.secondary" }}>
                    {pagamento.pago ? "Fatura paga" : "Marcar como paga"}
                  </Typography>
                  {pagamento.pago && (
                    <TextField
                      type="date"
                      size="small"
                      value={pagamento.dataPagamento ?? ""}
                      disabled={savingPagamento}
                      onChange={(e) => togglePagamento(true, e.target.value || null)}
                      sx={{
                        mt: 0.4,
                        "& .MuiInputBase-root": { fontSize: "0.75rem", height: 28 },
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        })()}
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid rgba(255,255,255,0.06)", px: 2 }} variant="scrollable" scrollButtons={false}>
        <Tab label="Fatura" />
        <Tab label="Assinaturas" />
        <Tab label="Parcelamentos" />
        <Tab label="Avulsos" />
      </Tabs>

      {/* ── Tab 0: Fatura ── */}
      {tab === 0 && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {loadingFatura ? (
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
          ) : faturaData ? (
            <>
              {(() => {
                const totalAnterior = faturaData.historico.length > 0
                  ? faturaData.historico[faturaData.historico.length - 1].total
                  : 0;
                const delta = faturaData.fatura.total - totalAnterior;
                const deltaPercent = totalAnterior > 0 ? (delta / totalAnterior) * 100 : 0;

                return (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1.8,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 1 }}>Resumo da leitura</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Chip label={`Assinaturas: ${formatBRL(faturaData.fatura.totalAssinaturas)}`} size="small" sx={{ justifyContent: "flex-start", bgcolor: "#f5f3ff", color: "#6d28d9" }} />
                      <Chip label={`Parcelamentos: ${formatBRL(faturaData.fatura.totalParcelamentos)}`} size="small" sx={{ justifyContent: "flex-start", bgcolor: "#fffbeb", color: "#b45309" }} />
                      <Chip label={`Avulsos: ${formatBRL(faturaData.fatura.totalAvulsos)}`} size="small" sx={{ justifyContent: "flex-start", bgcolor: "#eef2ff", color: "#4338ca" }} />
                      <Chip
                        label={delta >= 0 ? `+${deltaPercent.toFixed(0)}% vs mês anterior` : `${deltaPercent.toFixed(0)}% vs mês anterior`}
                        size="small"
                        sx={{
                          justifyContent: "flex-start",
                          bgcolor: delta >= 0 ? "#fff1f2" : "#f0fdf4",
                          color: delta >= 0 ? "#be123c" : "#166534",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Box>
                );
              })()}

              <FaturaChart
                historico={faturaData.historico}
                mesAtual={{ mesAno, total: faturaData.fatura.total }}
                forecast={faturaData.regressao.forecast}
                insufficient={faturaData.regressao.insufficient}
              />
              <Divider sx={{ my: 2 }} />
              {/* Breakdown */}
              {[
                {
                  label: "Assinaturas",
                  total: faturaData.fatura.totalAssinaturas,
                  color: "#8b5cf6",
                  chipBg: "#f5f3ff",
                  chipColor: "#6d28d9",
                  emptyText: "Sem cobranças recorrentes neste mês",
                  items: faturaData.fatura.assinaturas.map((a) => ({ key: a.id, primary: a.nome, secondary: "recorrente", value: a.valor, tag: "Recorrente" })),
                },
                {
                  label: "Parcelamentos",
                  total: faturaData.fatura.totalParcelamentos,
                  color: "#f59e0b",
                  chipBg: "#fffbeb",
                  chipColor: "#b45309",
                  emptyText: "Sem parcelas ativas neste mês",
                  items: faturaData.fatura.parcelamentos.map((p) => ({ key: p.id, primary: p.nome, secondary: `Parcela ${p.parcelaAtual}/${p.numeroParcelas}`, value: p.valorParcela, tag: `${p.parcelaAtual}/${p.numeroParcelas}` })),
                },
                {
                  label: "Avulsos",
                  total: faturaData.fatura.totalAvulsos,
                  color: cor,
                  chipBg: "#eef2ff",
                  chipColor: "#4338ca",
                  emptyText: "Sem lançamentos avulsos neste mês",
                  items: faturaData.fatura.avulsos.map((a) => ({ key: a.id, primary: a.nome, secondary: "lançamento único", value: a.valor, tag: "Avulso" })),
                },
              ].map(({ label, total, items, color, chipBg, chipColor, emptyText }) => (
                <Box
                  key={label}
                  sx={{
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ px: 1.6, py: 1.1, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, background: `${color}10` }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
                      <Typography variant="caption" color="text.secondary">{items.length} item{items.length !== 1 ? "s" : ""}</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color }}>{formatBRL(total)}</Typography>
                  </Box>

                  {items.length === 0 ? (
                    <Typography sx={{ px: 1.6, py: 1.3, fontSize: "0.82rem", color: "text.secondary" }}>{emptyText}</Typography>
                  ) : (
                    items.map((item, index) => (
                      <Box key={item.key} sx={{ px: 1.6, py: 1.1, display: "flex", justifyContent: "space-between", gap: 1.2, borderBottom: index === items.length - 1 ? "none" : "1px solid", borderColor: "divider" }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.primary}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
                            <Typography variant="caption" color="text.secondary">{item.secondary}</Typography>
                            <Chip label={item.tag} size="small" sx={{ height: 20, fontSize: "0.68rem", bgcolor: chipBg, color: chipColor, fontWeight: 700 }} />
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, flexShrink: 0 }}>{formatBRL(item.value)}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              ))}
            </>
          ) : null}
        </Box>
      )}

      {/* ── Tab 1: Assinaturas ── */}
      {tab === 1 && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {assinaturas.length > 0 && (
            <Box sx={{ mb: 2, pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Typography variant="caption" color="text.secondary">Total mensal recorrente</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{formatBRL(assinaturas.reduce((s, a) => s + a.valor, 0))}</Typography>
            </Box>
          )}
          {assinaturas.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>Nenhuma assinatura cadastrada</Typography>
          ) : assinaturas.map((a) => (
            <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{a.nome}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Desde {formatMesAno(a.dataInicio)}{a.dataFim ? ` · cancela em ${formatMesAno(a.dataFim)}` : " · ativa"}
                </Typography>
                {a.notas && (
                  <Typography variant="caption" sx={{ display: "block", color: "text.disabled", fontStyle: "italic", mt: 0.25 }}>{a.notas}</Typography>
                )}
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 700 }} color="primary.light">{formatBRL(a.valor)}/mês</Typography>
                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end", mt: 0.3 }}>
                  <Box onClick={() => { setAssinaturaDrawer({ open: true, edit: a }); setAssinaturaForm({ nome: a.nome, dataInicio: a.dataInicio, dataFim: a.dataFim ?? "", notas: a.notas ?? "" }); setAssinaturaValorCents(Math.round(a.valor * 100)); }} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "rgba(148,163,184,0.8)", "&:hover": { background: "rgba(255,255,255,0.08)" } }}>Editar</Box>
                  {!a.dataFim && <Box onClick={() => { setCancelarDialog({ open: true, assinatura: a }); setCancelarDataFim(currentMesAno()); }} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "#f59e0b", "&:hover": { background: "rgba(245,158,11,0.1)" } }}>Cancelar</Box>}
                  <Box onClick={() => deleteAssinatura(a.id)} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "#ef4444", "&:hover": { background: "rgba(239,68,68,0.1)" } }}>Excluir</Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Tab 2: Parcelamentos ── */}
      {tab === 2 && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {parcelamentos.length > 0 && (() => {
            const totalMensal = parcelamentos.reduce((s, p) => s + p.valorParcela, 0);
            const totalRestante = parcelamentos.reduce((s, p) => s + (p.numeroParcelas - p.parcelaAtual + 1) * p.valorParcela, 0);
            return (
              <Box sx={{ mb: 2, pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total mensal em parcelas</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{formatBRL(totalMensal)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Valor restante total</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>{formatBRL(totalRestante)}</Typography>
                </Box>
              </Box>
            );
          })()}
          {parcelamentos.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>Nenhum parcelamento cadastrado</Typography>
          ) : parcelamentos.map((p) => (
            <ParcelamentoListItem
              key={p.id}
              nome={p.nome}
              parcelaAtual={p.parcelaAtual}
              totalParcelas={p.numeroParcelas}
              valorParcela={p.valorParcela}
              valorTotal={p.valorTotal}
              mesInicio={p.mesInicio}
              mesFim={p.mesFim}
              notas={p.notas}
              onEdit={() => { setParcelamentoDrawer({ open: true, edit: p }); setParcelamentoForm({ nome: p.nome, numeroParcelas: String(p.numeroParcelas), mesInicio: p.mesInicio, notas: p.notas ?? "" }); setParcelamentoValorTotalCents(Math.round(p.valorTotal * 100)); }}
              onDelete={() => deleteParcelamento(p.id)}
            />
          ))}
        </Box>
      )}

      {/* ── Tab 3: Avulsos ── */}
      {tab === 3 && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {faturaData && faturaData.fatura.avulsos.length > 0 && (
            <Box sx={{ mb: 2, pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Typography variant="caption" color="text.secondary">Total neste mês ({formatMesAno(mesAno)})</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{formatBRL(faturaData.fatura.totalAvulsos)}</Typography>
            </Box>
          )}
          {!faturaData || faturaData.fatura.avulsos.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>Nenhum lançamento avulso em {formatMesAno(mesAno)}</Typography>
          ) : faturaData.fatura.avulsos.map((a) => (
            <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{a.nome}</Typography>
                {a.notas && (
                  <Typography variant="caption" sx={{ display: "block", color: "text.disabled", fontStyle: "italic" }}>{a.notas}</Typography>
                )}
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontWeight: 700 }}>{formatBRL(a.valor)}</Typography>
                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end", mt: 0.3 }}>
                  <Box onClick={() => { setAvulsoDrawer({ open: true, edit: a }); setAvulsoForm({ nome: a.nome, notas: a.notas ?? "" }); setAvulsoValorCents(Math.round(a.valor * 100)); }} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "rgba(148,163,184,0.8)", "&:hover": { background: "rgba(255,255,255,0.08)" } }}>Editar</Box>
                  <Box onClick={() => deleteAvulso(a.id)} sx={{ fontSize: "0.65rem", px: 0.8, py: 0.3, borderRadius: "5px", cursor: "pointer", color: "#ef4444", "&:hover": { background: "rgba(239,68,68,0.1)" } }}>Excluir</Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {tab > 0 && (
        <Fab
          color="primary"
          aria-label={getCreateFabLabel(tab)}
          onClick={openCreateDrawerForCurrentTab}
          sx={{
            position: "fixed",
            bottom: { xs: 88, md: 28 },
            right: 24,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            bgcolor: getCreateFabColor(tab, cor),
            color: "#fff",
            boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
            "&:hover": {
              bgcolor: getCreateFabColor(tab, cor),
              filter: "brightness(0.93)",
            },
          }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {/* ── Assinatura Drawer ──────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={assinaturaDrawer.open}
        onClose={() => setAssinaturaDrawer({ open: false, edit: null })}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" } } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #7c3aedee 0%, #8b5cf6 100%)", px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
          <IconButton onClick={() => setAssinaturaDrawer({ open: false, edit: null })} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
            <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
              <RepeatRoundedIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                {assinaturaDrawer.edit ? "Editar Assinatura" : "Nova Assinatura"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                Cobrança mensal recorrente no cartão
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Identificação</Typography>
            <TextField
              label="Nome da assinatura"
              value={assinaturaForm.nome}
              onChange={(e) => setAssinaturaForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth required autoFocus={!assinaturaDrawer.edit}
              placeholder="Ex: Netflix, Spotify, Adobe CC..."
              helperText="Como você identifica essa assinatura"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
            />
          </Box>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Valor</Typography>
            <CurrencyInput
              label="Valor mensal"
              valueCents={assinaturaValorCents}
              onValueChange={setAssinaturaValorCents}
              fullWidth required
              helperText="Valor cobrado mensalmente no cartão"
            />
          </Box>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Vigência</Typography>
            <TextField
              label="Mês de início"
              value={assinaturaForm.dataInicio}
              onChange={(e) => setAssinaturaForm((f) => ({ ...f, dataInicio: e.target.value }))}
              fullWidth required placeholder="2025-01"
              helperText="Mês em que a assinatura começou (AAAA-MM)"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> }, inputLabel: { shrink: true } }}
            />
            <TextField
              label="Mês de fim (opcional)"
              value={assinaturaForm.dataFim}
              onChange={(e) => setAssinaturaForm((f) => ({ ...f, dataFim: e.target.value }))}
              fullWidth placeholder="2025-12"
              helperText="Deixe em branco se ainda está ativa"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> }, inputLabel: { shrink: true } }}
            />
          </Box>
          <Divider />
          <TextField
            label="Observações (opcional)"
            value={assinaturaForm.notas}
            onChange={(e) => setAssinaturaForm((f) => ({ ...f, notas: e.target.value }))}
            fullWidth multiline rows={3}
            placeholder="Plano contratado, data de renovação..."
            helperText="Informações extras sobre essa assinatura"
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><NotesRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setAssinaturaDrawer({ open: false, edit: null })}>Cancelar</Button>
          <Button fullWidth variant="contained" onClick={saveAssinatura} disabled={saving || !assinaturaForm.nome.trim() || assinaturaValorCents === 0} sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#8b5cf6", filter: "brightness(0.9)" } }}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>

      {/* ── Cancelar Assinatura Dialog ── */}
      <Dialog open={cancelarDialog.open} onClose={() => setCancelarDialog({ open: false, assinatura: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Cancelar Assinatura</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>A assinatura <strong>{cancelarDialog.assinatura?.nome}</strong> será marcada como cancelada a partir de:</Typography>
          <TextField label="Mês de cancelamento (AAAA-MM)" value={cancelarDataFim} onChange={(e) => setCancelarDataFim(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelarDialog({ open: false, assinatura: null })}>Voltar</Button>
          <Button variant="contained" color="warning" onClick={cancelarAssinatura}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* ── Parcelamento Drawer ─────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={parcelamentoDrawer.open}
        onClose={() => setParcelamentoDrawer({ open: false, edit: null })}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" } } }}
      >
        <Box sx={{ background: "linear-gradient(135deg, #d97706ee 0%, #f59e0b 100%)", px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
          <IconButton onClick={() => setParcelamentoDrawer({ open: false, edit: null })} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
            <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
              <PaymentsRoundedIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                {parcelamentoDrawer.edit ? "Editar Parcelamento" : "Novo Parcelamento"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                Compra parcelada no cartão
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Identificação</Typography>
            <TextField
              label="Nome da compra"
              value={parcelamentoForm.nome}
              onChange={(e) => setParcelamentoForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth required autoFocus={!parcelamentoDrawer.edit}
              placeholder="Ex: iPhone 15, TV Samsung, Notebook..."
              helperText="Descreva o que foi comprado"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
            />
          </Box>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Parcelamento</Typography>
            <CurrencyInput
              label="Valor total da compra"
              valueCents={parcelamentoValorTotalCents}
              onValueChange={setParcelamentoValorTotalCents}
              fullWidth required
              helperText="Valor total que foi parcelado"
            />
            <TextField
              label="Número de parcelas"
              type="number"
              value={parcelamentoForm.numeroParcelas}
              onChange={(e) => setParcelamentoForm((f) => ({ ...f, numeroParcelas: e.target.value }))}
              fullWidth required
              helperText="Quantas vezes foi parcelado"
              slotProps={{ input: { inputProps: { min: 2 } }, inputLabel: { shrink: true } }}
            />
            <TextField
              label="Mês de início"
              value={parcelamentoForm.mesInicio}
              onChange={(e) => setParcelamentoForm((f) => ({ ...f, mesInicio: e.target.value }))}
              fullWidth required placeholder="2025-01"
              helperText="Mês em que a primeira parcela foi cobrada (AAAA-MM)"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> }, inputLabel: { shrink: true } }}
            />
            {parcelamentoValorTotalCents > 0 && parcelamentoForm.numeroParcelas && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 2 }}>
                <PaymentsRoundedIcon sx={{ fontSize: 18, color: "#d97706", flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600 }}>
                  {formatBRL(parcelamentoValorTotalCents / 100 / (parseInt(parcelamentoForm.numeroParcelas) || 1))} / mês por {parcelamentoForm.numeroParcelas}x
                </Typography>
              </Box>
            )}
          </Box>
          <Divider />
          <TextField
            label="Observações (opcional)"
            value={parcelamentoForm.notas}
            onChange={(e) => setParcelamentoForm((f) => ({ ...f, notas: e.target.value }))}
            fullWidth multiline rows={3}
            placeholder="Loja, garantia, notas da compra..."
            helperText="Informações extras sobre esse parcelamento"
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><NotesRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setParcelamentoDrawer({ open: false, edit: null })}>Cancelar</Button>
          <Button fullWidth variant="contained" onClick={saveParcelamento} disabled={saving || !parcelamentoForm.nome.trim() || parcelamentoValorTotalCents === 0} sx={{ bgcolor: "#f59e0b", "&:hover": { bgcolor: "#f59e0b", filter: "brightness(0.9)" } }}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>

      {/* ── Avulso Drawer ──────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={avulsoDrawer.open}
        onClose={() => setAvulsoDrawer({ open: false, edit: null })}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" } } }}
      >
        <Box sx={{ background: `linear-gradient(135deg, ${cor}ee 0%, ${cor} 100%)`, px: 3, pt: 3, pb: 2.5, color: "white", position: "relative", flexShrink: 0 }}>
          <IconButton onClick={() => setAvulsoDrawer({ open: false, edit: null })} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}>
            <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 1.25, flexShrink: 0 }}>
              <ReceiptRoundedIcon sx={{ fontSize: 28, color: "white", display: "block" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                {avulsoDrawer.edit ? "Editar Lançamento" : "Novo Lançamento Avulso"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.4, display: "block", mt: 0.5 }}>
                Lançamento único em {formatMesLabel(mesAno)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Identificação</Typography>
            <TextField
              label="Descrição do lançamento"
              value={avulsoForm.nome}
              onChange={(e) => setAvulsoForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth required autoFocus={!avulsoDrawer.edit}
              placeholder="Ex: Jantar restaurante, Uber, Farmácia..."
              helperText="O que foi comprado ou pago"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LabelRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
            />
          </Box>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Valor</Typography>
            <CurrencyInput
              label="Valor"
              valueCents={avulsoValorCents}
              onValueChange={setAvulsoValorCents}
              fullWidth required
              helperText={`Será lançado na fatura de ${formatMesLabel(mesAno)}`}
            />
          </Box>
          <Divider />
          <TextField
            label="Observações (opcional)"
            value={avulsoForm.notas}
            onChange={(e) => setAvulsoForm((f) => ({ ...f, notas: e.target.value }))}
            fullWidth multiline rows={3}
            placeholder="Local, contexto, anotações..."
            helperText="Informações extras sobre esse lançamento"
            slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><NotesRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setAvulsoDrawer({ open: false, edit: null })}>Cancelar</Button>
          <Button fullWidth variant="contained" onClick={saveAvulso} disabled={saving || !avulsoForm.nome.trim() || avulsoValorCents === 0} sx={{ bgcolor: cor, "&:hover": { bgcolor: cor, filter: "brightness(0.9)" } }}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
