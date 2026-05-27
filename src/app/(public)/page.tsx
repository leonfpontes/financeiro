"use client";

import { useEffect, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import { useTheme } from "@mui/material/styles";
import { Logo } from "@/components/layout/Logo";
import HomeGranaMinha from "@/img/Home_GranaMinha.png";
import CartoesGranaMinha from "@/img/Cartoes_GranaMinha.png";
import FaturaGranaMinha from "@/img/Fatura_GranaMinha.png";
import EvolucaoGranaMinha from "@/img/Evolucao_GranaMinha.png";
import EvolucaoGranaMinha2 from "@/img/Evolucao_GranaMinha2.png";
import EntradasGranaMinha from "@/img/Entradas_GranaMinha.png";
import GastosGranaMinha from "@/img/Gastos_GranaMinha.png";
import GastosGranaMinha2 from "@/img/Gastos_GranaMinha2.png";
import CompromissosGranaMinha from "@/img/Compromissos_GranaMinha.png";

type GalleryItem = {
  key: string;
  title: string;
  benefit: string;
  src: StaticImageData;
};

const gallery: GalleryItem[] = [
  {
    key: "home",
    title: "Visão mensal completa",
    benefit: "Saiba em segundos se sobra ou falta dinheiro no mês.",
    src: HomeGranaMinha,
  },
  {
    key: "entradas",
    title: "Entradas organizadas",
    benefit: "Compare renda fixa e variável com clareza.",
    src: EntradasGranaMinha,
  },
  {
    key: "gastos-1",
    title: "Gastos por tipo",
    benefit: "Controle fixos, variáveis e sazonais sem planilha.",
    src: GastosGranaMinha,
  },
  {
    key: "gastos-2",
    title: "Cadastro inteligente",
    benefit: "Edite valores e vigência com fluxo rápido.",
    src: GastosGranaMinha2,
  },
  {
    key: "compromissos",
    title: "Compromissos e metas",
    benefit: "Acompanhe dívidas, investimentos e sonhos no mesmo painel.",
    src: CompromissosGranaMinha,
  },
  {
    key: "evolucao-1",
    title: "Evolução financeira",
    benefit: "Enxergue tendência de entradas, saídas e margem.",
    src: EvolucaoGranaMinha,
  },
  {
    key: "evolucao-2",
    title: "Composição detalhada",
    benefit: "Entenda exatamente onde seu dinheiro está indo.",
    src: EvolucaoGranaMinha2,
  },
  {
    key: "cartoes",
    title: "Cartões em tempo real",
    benefit: "Veja limite, uso e risco de forma preventiva.",
    src: CartoesGranaMinha,
  },
  {
    key: "fatura",
    title: "Fatura com previsão",
    benefit: "Antecipe gastos e tome decisões antes de estourar o mês.",
    src: FaturaGranaMinha,
  },
];

const moduleMap = {
  entradas: [gallery[1]],
  gastos: [gallery[2], gallery[3]],
  compromissos: [gallery[4]],
  evolucao: [gallery[5], gallery[6]],
  cartoes: [gallery[7], gallery[8]],
} as const;

type ModuleKey = keyof typeof moduleMap;

const moduleInfo: Record<ModuleKey, { title: string; subtitle: string }> = {
  entradas: {
    title: "Entradas",
    subtitle: "Consolide salário, renda extra e previsão anual em uma única visualização.",
  },
  gastos: {
    title: "Gastos",
    subtitle: "Classifique despesas por comportamento e corte excessos com prioridade.",
  },
  compromissos: {
    title: "Compromissos",
    subtitle: "Alinhe dívidas, investimentos e sonhos para não travar seu caixa.",
  },
  evolucao: {
    title: "Evolução",
    subtitle: "Compare planejado x realizado e acompanhe tendência mês a mês.",
  },
  cartoes: {
    title: "Cartões",
    subtitle: "Monitore limite, fatura e previsão de uso sem surpresas no fechamento.",
  },
};

export default function LandingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [moduleKey, setModuleKey] = useState<ModuleKey>("entradas");
  const [mobileIndex, setMobileIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerZoom, setViewerZoom] = useState(1);

  const selectedModule = moduleInfo[moduleKey];
  const selectedImages = moduleMap[moduleKey];
  const mobileItem = gallery[mobileIndex];

  const next = () => setMobileIndex((p) => (p + 1) % gallery.length);
  const prev = () => setMobileIndex((p) => (p - 1 + gallery.length) % gallery.length);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerZoom(1);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerZoom(1);
  };

  const nextViewer = () => {
    setViewerIndex((p) => (p + 1) % gallery.length);
    setViewerZoom(1);
  };

  const prevViewer = () => {
    setViewerIndex((p) => (p - 1 + gallery.length) % gallery.length);
    setViewerZoom(1);
  };

  const zoomIn = () => setViewerZoom((z) => Math.min(3, Number((z + 0.2).toFixed(2))));
  const zoomOut = () => setViewerZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))));
  const resetZoom = () => setViewerZoom(1);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowRight") nextViewer();
      if (ev.key === "ArrowLeft") prevViewer();
      if (ev.key === "+" || ev.key === "=") zoomIn();
      if (ev.key === "-") zoomOut();
      if (ev.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerOpen]);

  const stats = useMemo(
    () => [
      { label: "Plataforma", value: "100% Grátis", icon: TaskAltRoundedIcon },
      { label: "Visão", value: "360 graus", icon: InsightsRoundedIcon },
      { label: "Foco", value: "Decisão rápida", icon: TrendingUpRoundedIcon },
      { label: "Método", value: "Sem planilhas", icon: SavingsRoundedIcon },
    ],
    []
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(120% 120% at 10% 0%, rgba(129,140,248,0.22) 0%, rgba(11,7,31,1) 55%, rgba(5,5,20,1) 100%)",
        color: "#e5e7eb",
        pb: { xs: 10, md: 0 },
      }}
    >
      {/* Header full-bleed sticky — Container interno garante o respiro lateral */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(14px)",
          backgroundColor: "rgba(10,8,28,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          width: "100%",
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Box
            sx={{
              py: 2,
              px: { xs: 3, md: 6 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Logo size={34} />
              <Typography sx={{ fontWeight: 800, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                GranaMinha
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button component={Link} href="/login" variant="text" sx={{ color: "#c7d2fe", fontWeight: 700 }}>
                Entrar
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 10px 25px rgba(99,102,241,0.42)",
                }}
              >
                Começar grátis
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            pt: { xs: 6, md: 9 },
            display: "grid",
            gap: { xs: 4, md: 5 },
            gridTemplateColumns: { xs: "1fr", lg: "1.02fr 0.98fr" },
            alignItems: "center",
          }}
        >
          <Box>
            <Chip
              icon={<ShieldRoundedIcon />}
              label="Produto completo e gratuito"
              sx={{
                mb: 2,
                bgcolor: "rgba(16,185,129,0.16)",
                color: "#86efac",
                border: "1px solid rgba(16,185,129,0.4)",
                fontWeight: 700,
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "3.5rem" },
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                fontWeight: 900,
                color: "#f8fafc",
              }}
            >
              Controle suas finanças com clareza, sem pagar nada.
            </Typography>
            <Typography sx={{ mt: 2, color: "#cbd5e1", maxWidth: 620, fontSize: { xs: "1rem", md: "1.1rem" } }}>
              Entenda entradas, gastos, cartões, compromissos e evolução em uma experiência visual que ajuda você a decidir rápido.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  py: 1.3,
                  px: 2.5,
                  background: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
                  boxShadow: "0 12px 26px rgba(16,185,129,0.35)",
                }}
              >
                Criar conta gratuita
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  py: 1.3,
                  px: 2.5,
                  color: "#e2e8f0",
                  borderColor: "rgba(148,163,184,0.45)",
                }}
              >
                Já tenho conta
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2.2 }}>
              <Chip label="Sem cartão de crédito" sx={{ bgcolor: "rgba(99,102,241,0.14)", color: "#c7d2fe" }} />
              <Chip label="Sem limite de módulos" sx={{ bgcolor: "rgba(99,102,241,0.14)", color: "#c7d2fe" }} />
              <Chip label="Sem pegadinha" sx={{ bgcolor: "rgba(99,102,241,0.14)", color: "#c7d2fe" }} />
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(129,140,248,0.38)",
              background: "linear-gradient(180deg, rgba(30,24,69,0.7) 0%, rgba(13,10,34,0.9) 100%)",
              boxShadow: "0 30px 60px rgba(2,6,23,0.65)",
              animation: "floatCard 5.6s ease-in-out infinite",
              "@keyframes floatCard": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-10px)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            <Image
              src={HomeGranaMinha}
              alt="Painel principal do GranaMinha"
              priority
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" },
            gap: 1.2,
          }}
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <Box
              key={label}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: isDark ? "rgba(15,23,42,0.6)" : "rgba(15,23,42,0.82)",
                border: "1px solid rgba(129,140,248,0.2)",
                transition: "transform 0.2s ease, border-color 0.2s ease",
                "&:hover": { transform: "translateY(-4px)", borderColor: "rgba(129,140,248,0.45)" },
                "@media (prefers-reduced-motion: reduce)": { transition: "none" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
                <Icon sx={{ color: "#a5b4fc", fontSize: 18 }} />
                <Typography sx={{ color: "#94a3b8", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#f8fafc" }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: { xs: 6, md: 9 } }}>
          <Typography sx={{ fontSize: { xs: "1.65rem", md: "2.3rem" }, fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.02em" }}>
            Explore os módulos da plataforma
          </Typography>
          <Typography sx={{ mt: 1, color: "#cbd5e1", maxWidth: 760 }}>
            Troque de módulo e veja como cada tela foi desenhada para transformar dados financeiros em decisões práticas.
          </Typography>

          <ToggleButtonGroup
            value={moduleKey}
            exclusive
            onChange={(_, value: ModuleKey | null) => {
              if (value) setModuleKey(value);
            }}
            sx={{ mt: 2.5, flexWrap: "wrap", gap: 1 }}
          >
            <ToggleButton value="entradas" sx={{ color: "#cbd5e1", borderColor: "rgba(129,140,248,0.32)", textTransform: "none", fontWeight: 700 }}>
              <TrendingUpRoundedIcon sx={{ mr: 0.7, fontSize: 18 }} /> Entradas
            </ToggleButton>
            <ToggleButton value="gastos" sx={{ color: "#cbd5e1", borderColor: "rgba(129,140,248,0.32)", textTransform: "none", fontWeight: 700 }}>
              <ReceiptLongRoundedIcon sx={{ mr: 0.7, fontSize: 18 }} /> Gastos
            </ToggleButton>
            <ToggleButton value="compromissos" sx={{ color: "#cbd5e1", borderColor: "rgba(129,140,248,0.32)", textTransform: "none", fontWeight: 700 }}>
              <AccountBalanceRoundedIcon sx={{ mr: 0.7, fontSize: 18 }} /> Compromissos
            </ToggleButton>
            <ToggleButton value="evolucao" sx={{ color: "#cbd5e1", borderColor: "rgba(129,140,248,0.32)", textTransform: "none", fontWeight: 700 }}>
              <InsightsRoundedIcon sx={{ mr: 0.7, fontSize: 18 }} /> Evolução
            </ToggleButton>
            <ToggleButton value="cartoes" sx={{ color: "#cbd5e1", borderColor: "rgba(129,140,248,0.32)", textTransform: "none", fontWeight: 700 }}>
              <CreditCardRoundedIcon sx={{ mr: 0.7, fontSize: 18 }} /> Cartões
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ mt: 2.5, p: { xs: 2, md: 2.5 }, borderRadius: 3, border: "1px solid rgba(129,140,248,0.22)", bgcolor: "rgba(15,23,42,0.45)" }}>
            <Typography sx={{ color: "#f8fafc", fontWeight: 800, fontSize: "1.28rem" }}>{selectedModule.title}</Typography>
            <Typography sx={{ color: "#94a3b8", mt: 0.7 }}>{selectedModule.subtitle}</Typography>

            <Box sx={{ mt: 2, display: "grid", gap: 1.4, gridTemplateColumns: { xs: "1fr", md: selectedImages.length > 1 ? "1fr 1fr" : "1fr" } }}>
              {selectedImages.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 3,
                    border: "1px solid rgba(129,140,248,0.3)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 30px rgba(2,6,23,0.5)" },
                    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
                  }}
                >
                  <Image src={item.src} alt={item.title} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                  <Box sx={{ p: 1.2, bgcolor: "rgba(10,12,30,0.84)" }}>
                    <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.94rem" }}>{item.title}</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem", mt: 0.4 }}>{item.benefit}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 6, md: 9 } }}>
          <Typography sx={{ fontWeight: 900, color: "#f8fafc", fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: "-0.02em" }}>
            Tour visual completo
          </Typography>
          <Typography sx={{ mt: 1, color: "#94a3b8" }}>
            Todas as telas abaixo são reais da plataforma. O que você vê aqui é o que vai usar no dia a dia.
          </Typography>

          <Box sx={{ mt: 2.5, display: { xs: "none", md: "grid" }, gridTemplateColumns: "repeat(3, 1fr)", gap: 1.2 }}>
            {gallery.map((item) => (
              <Box
                key={item.key}
                onClick={() => openViewer(gallery.findIndex((g) => g.key === item.key))}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid rgba(129,140,248,0.28)",
                  bgcolor: "rgba(11,15,35,0.72)",
                  cursor: "zoom-in",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "rgba(129,140,248,0.52)",
                    boxShadow: "0 20px 36px rgba(2,6,23,0.55)",
                  },
                }}
              >
                <Image src={item.src} alt={item.title} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                <Box sx={{ p: 1.1 }}>
                  <Typography sx={{ color: "#f8fafc", fontSize: "0.88rem", fontWeight: 700 }}>{item.title}</Typography>
                  <Typography sx={{ color: "#94a3b8", fontSize: "0.79rem", mt: 0.35 }}>{item.benefit}</Typography>
                  <Typography sx={{ color: "#a5b4fc", fontSize: "0.72rem", mt: 0.55, fontWeight: 700 }}>
                    Clique para ampliar
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            sx={{ mt: 2, display: { xs: "block", md: "none" }, borderRadius: 3, border: "1px solid rgba(129,140,248,0.3)", overflow: "hidden", bgcolor: "rgba(11,15,35,0.72)" }}
          >
            <Image src={mobileItem.src} alt={mobileItem.title} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
            <Box sx={{ p: 1.3 }}>
              <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>{mobileItem.title}</Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.84rem", mt: 0.45 }}>{mobileItem.benefit}</Typography>
              <Button
                variant="text"
                startIcon={<OpenInFullRoundedIcon />}
                onClick={() => openViewer(mobileIndex)}
                sx={{ mt: 0.6, textTransform: "none", fontWeight: 800, color: "#a5b4fc", px: 0 }}
              >
                Abrir em detalhe
              </Button>
              <Box sx={{ mt: 1.1, display: "flex", justifyContent: "space-between" }}>
                <IconButton onClick={prev} sx={{ color: "#c7d2fe" }}>
                  <ChevronLeftRoundedIcon />
                </IconButton>
                <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem", alignSelf: "center" }}>
                  {mobileIndex + 1} de {gallery.length}
                </Typography>
                <IconButton onClick={next} sx={{ color: "#c7d2fe" }}>
                  <ChevronRightRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography sx={{ fontWeight: 900, color: "#f8fafc", fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: "-0.02em" }}>
            Perguntas frequentes
          </Typography>
          <Typography sx={{ mt: 1, color: "#94a3b8", maxWidth: 760 }}>
            Tudo que você precisa saber para começar hoje, sem custo e sem travas.
          </Typography>

          <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.2 }}>
            {[
              {
                q: "A plataforma é realmente gratuita?",
                a: "Sim. O uso completo da plataforma é gratuito, sem cartão de crédito e sem bloqueio de módulos essenciais.",
              },
              {
                q: "Consigo ver entradas, gastos e cartões no mesmo lugar?",
                a: "Consegue. A proposta do GranaMinha é centralizar toda sua visão financeira em uma experiência única e objetiva.",
              },
              {
                q: "A landing mostra telas reais do produto?",
                a: "Sim. Todas as imagens exibidas são capturas reais da plataforma em uso, não mockups artificiais.",
              },
              {
                q: "Posso usar no celular e no desktop?",
                a: "Sim. A interface foi desenhada para funcionar bem em mobile, tablet e desktop, com navegação e leitura claras.",
              },
            ].map((faq) => (
              <Accordion
                key={faq.q}
                disableGutters
                sx={{
                  bgcolor: "rgba(11,15,35,0.72)",
                  border: "1px solid rgba(129,140,248,0.25)",
                  borderRadius: "12px !important",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: "#c7d2fe" }} />}>
                  <Typography sx={{ color: "#f8fafc", fontWeight: 700 }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.6 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 7, md: 10 },
            mb: { xs: 4, md: 8 },
            p: { xs: 2.5, md: 4 },
            borderRadius: 4,
            border: "1px solid rgba(16,185,129,0.38)",
            background: "linear-gradient(135deg, rgba(15,118,110,0.20) 0%, rgba(16,185,129,0.14) 100%)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: { xs: "1.5rem", md: "2.4rem" }, fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.02em" }}>
            Comece hoje, sem custo.
          </Typography>
          <Typography sx={{ mt: 1, color: "#d1fae5", maxWidth: 760, mx: "auto" }}>
            Crie sua conta em minutos e ganhe visão completa das suas finanças com uma plataforma realmente gratuita.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} sx={{ mt: 2.5, justifyContent: "center" }}>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 900,
                py: 1.2,
                px: 2.4,
                background: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
              }}
            >
              Quero usar grátis
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              size="large"
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 900, borderColor: "rgba(167,243,208,0.55)", color: "#d1fae5" }}
            >
              Já tenho conta
            </Button>
          </Stack>
        </Box>
      </Container>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 1.2,
          background: "rgba(6,10,26,0.92)",
          borderTop: "1px solid rgba(129,140,248,0.3)",
          backdropFilter: "blur(10px)",
          zIndex: 30,
        }}
      >
        <Button
          fullWidth
          component={Link}
          href="/register"
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            py: 1.2,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          }}
        >
          Começar grátis agora
        </Button>
      </Box>

      <Dialog open={viewerOpen} onClose={closeViewer} fullWidth maxWidth="xl" sx={{ "& .MuiDialog-paper": { bgcolor: "rgba(4,6,18,0.97)", border: "1px solid rgba(129,140,248,0.35)", borderRadius: 3 } }}>
        <DialogContent sx={{ p: { xs: 1, md: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Box>
              <Typography sx={{ color: "#f8fafc", fontWeight: 800 }}>{gallery[viewerIndex]?.title}</Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.84rem" }}>{gallery[viewerIndex]?.benefit}</Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Diminuir zoom (-)">
                <span>
                  <IconButton onClick={zoomOut} sx={{ color: "#c7d2fe" }}>
                    <ZoomOutRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Aumentar zoom (+)">
                <span>
                  <IconButton onClick={zoomIn} sx={{ color: "#c7d2fe" }}>
                    <ZoomInRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Resetar zoom (0)">
                <span>
                  <IconButton onClick={resetZoom} sx={{ color: "#c7d2fe" }}>
                    <RestartAltRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Fechar">
                <span>
                  <IconButton onClick={closeViewer} sx={{ color: "#fda4af" }}>
                    <CloseRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>

          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(129,140,248,0.3)", bgcolor: "rgba(11,15,35,0.85)", minHeight: { xs: 220, md: 520 } }}>
            <Box
              onWheel={(ev) => {
                ev.preventDefault();
                if (ev.deltaY < 0) zoomIn();
                else zoomOut();
              }}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
              }}
            >
              <Image
                src={gallery[viewerIndex]?.src}
                alt={gallery[viewerIndex]?.title}
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transform: `scale(${viewerZoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.18s ease",
                  cursor: viewerZoom > 1 ? "zoom-out" : "zoom-in",
                }}
                onClick={() => {
                  if (viewerZoom > 1) resetZoom();
                  else zoomIn();
                }}
              />
            </Box>

            <IconButton onClick={prevViewer} sx={{ position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)", color: "#c7d2fe", bgcolor: "rgba(15,23,42,0.55)", "&:hover": { bgcolor: "rgba(30,41,59,0.75)" } }}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton onClick={nextViewer} sx={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", color: "#c7d2fe", bgcolor: "rgba(15,23,42,0.55)", "&:hover": { bgcolor: "rgba(30,41,59,0.75)" } }}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Box>

          <Typography sx={{ mt: 1, textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
            {viewerIndex + 1} de {gallery.length} · Setas para navegar · + / - para zoom
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
