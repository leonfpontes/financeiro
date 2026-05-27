import type { StepType } from "@reactour/tour";
import type { TourStepMeta } from "../types";

// Accent colors per section
const IND = "#6366f1"; // Indigo — Welcome + Fotografia
const GRN = "#10b981"; // Verde  — Entradas
const ORG = "#f97316"; // Laranja — Gastos
const PUR = "#8b5cf6"; // Roxo   — Compromissos
const CYN = "#06b6d4"; // Ciano  — Evolução
const PNK = "#ec4899"; // Rosa   — Cartões

function step(
  meta: TourStepMeta,
  selector: string,
  position: StepType["position"] = "bottom",
): StepType {
  return {
    selector,
    content: meta as unknown as string,
    position,
  };
}

export const tourSteps: StepType[] = [
  // 0 — Welcome (always shown, uses body as anchor)
  step(
    {
      emoji: "🎉",
      title: "Bem-vindo ao GranaMinha!",
      body: "Sou seu guia e vou te mostrar tudo em menos de 2 minutos. Preparado para dominar suas finanças? 🚀",
      accent: IND,
    },
    "body",
    "center",
  ),

  // 1 — Sidebar nav
  step(
    {
      emoji: "🗺️",
      title: "Sua central de navegação",
      body: "Aqui ficam todas as seções do app — de Fotografia a Cartões. Um clique e você está lá!",
      accent: IND,
    },
    '[data-tour="sidebar-nav"]',
    "right",
  ),

  // 2 — Month nav
  step(
    {
      emoji: "📅",
      title: "Viaje no tempo financeiro",
      body: "Use as setas para navegar entre os meses. Passado, presente ou futuro — cada mês é uma fotografia única!",
      accent: IND,
    },
    '[data-tour="fotografia-mes-nav"]',
  ),

  // 3 — Hero disponível
  step(
    {
      emoji: "💰",
      title: "O número que mais importa",
      body: "Quanto sobra depois de pagar tudo? Verde = ótimo. Vermelho = hora de rever os gastos. Mantenha sempre positivo! 🟢",
      accent: IND,
    },
    '[data-tour="fotografia-hero-disponivel"]',
  ),

  // 4 — KPI cards
  step(
    {
      emoji: "📊",
      title: "Os 6 pilares do orçamento",
      body: "Entradas, compromissos, gastos fixos, variáveis, sazonais e margem. Juntos formam a fórmula do seu mês.",
      accent: IND,
    },
    '[data-tour="fotografia-kpi-cards"]',
  ),

  // 5 — Fórmula
  step(
    {
      emoji: "🧮",
      title: "A matemática do seu dinheiro",
      body: "Entradas − obrigações − gastos = liberdade financeira. Quanto maior o resultado, melhor a saúde do bolso! 🎯",
      accent: IND,
    },
    '[data-tour="fotografia-formula"]',
  ),

  // 6 — Insights
  step(
    {
      emoji: "🤖",
      title: "Seu consultor automático",
      body: "Análises inteligentes que detectam riscos e oportunidades no seu orçamento em tempo real. Nem um banco faz isso!",
      accent: IND,
    },
    '[data-tour="fotografia-insights"]',
  ),

  // 7 — Cartões resumo
  step(
    {
      emoji: "💳",
      title: "Fatura no resumo",
      body: "Veja o total da fatura e o percentual do limite usado — sem precisar abrir a aba de cartões. Praticidade máxima!",
      accent: IND,
    },
    '[data-tour="fotografia-cartoes-resumo"]',
  ),

  // 8 — Plano de ação
  step(
    {
      emoji: "📝",
      title: "Seu diário financeiro",
      body: "Escreva metas, lembretes e decisões. Seu eu do futuro vai agradecer cada anotação feita aqui. 💌",
      accent: IND,
    },
    '[data-tour="fotografia-plano-acao"]',
  ),

  // 9 — Entradas: total
  step(
    {
      emoji: "💵",
      title: "Sua renda total ativa",
      body: "Soma automática de todas as fontes ativas. Inativou uma entrada? O total atualiza na hora — magia! ✨",
      accent: GRN,
    },
    '[data-tour="entradas-total-card"]',
  ),

  // 10 — Entradas: list
  step(
    {
      emoji: "📋",
      title: "Suas fontes de renda",
      body: "Salário, freela, aluguel... cada entrada tem tipo, valor e status. Toque em ⋮ para editar ou desativar.",
      accent: GRN,
    },
    '[data-tour="entradas-list"]',
  ),

  // 11 — Entradas: FAB
  step(
    {
      emoji: "➕",
      title: "Adicionar nova entrada",
      body: "Toque aqui para cadastrar uma nova fonte de renda. Em menos de 30 segundos está feito! ⚡",
      accent: GRN,
    },
    '[data-tour="entradas-fab"]',
    "left",
  ),

  // 12 — Gastos: tabs
  step(
    {
      emoji: "🗂️",
      title: "3 tipos de despesa",
      body: "Fixo (todo mês), Variável (oscila) e Sazonal (só em meses específicos, como IPTU). Cada um no seu lugar certo.",
      accent: ORG,
    },
    '[data-tour="gastos-tabs"]',
  ),

  // 13 — Gastos: list
  step(
    {
      emoji: "💸",
      title: "Seus gastos cadastrados",
      body: "Cada item mostra o custo mensal estimado. Toque em ⋮ para editar ou expanda para ver mais detalhes.",
      accent: ORG,
    },
    '[data-tour="gastos-list"]',
  ),

  // 14 — Gastos: FAB
  step(
    {
      emoji: "➕",
      title: "Novo gasto",
      body: "Cadastre uma despesa com ícone personalizado — deixe seu orçamento com a sua identidade! 🎨",
      accent: ORG,
    },
    '[data-tour="gastos-fab"]',
    "left",
  ),

  // 15 — Compromissos: métricas
  step(
    {
      emoji: "📈",
      title: "Seu placar financeiro",
      body: "Dívidas, investimentos e sonhos lado a lado. Ideal para manter equilíbrio e visualizar o progresso de vida.",
      accent: PUR,
    },
    '[data-tour="compromissos-metricas"]',
  ),

  // 16 — Compromissos: lista
  step(
    {
      emoji: "🏦",
      title: "Seus compromissos",
      body: "Do financiamento ao fundo de emergência, da viagem dos sonhos ao investimento mensal — tudo organizado aqui.",
      accent: PUR,
    },
    '[data-tour="compromissos-lista"]',
  ),

  // 17 — Compromissos: FAB
  step(
    {
      emoji: "✨",
      title: "Novo compromisso",
      body: "Cadastre uma dívida para monitorar, um investimento recorrente ou aquele sonho que você está perseguindo!",
      accent: PUR,
    },
    '[data-tour="compromissos-fab"]',
    "left",
  ),

  // 18 — Evolução: KPI row
  step(
    {
      emoji: "📉",
      title: "Médias do período",
      body: "Visão consolidada das suas médias de renda, gastos e disponível. Use os filtros 3M, 6M, 12M ou 24M.",
      accent: CYN,
    },
    '[data-tour="evolucao-kpi-row"]',
  ),

  // 19 — Evolução: fluxo
  step(
    {
      emoji: "📈",
      title: "Fluxo de caixa",
      body: "Verde = entradas. Vermelho = saídas. Linha azul = o que sobrou. Quanto maior a diferença, mais saudável o bolso! 📐",
      accent: CYN,
    },
    '[data-tour="evolucao-chart-fluxo"]',
  ),

  // 20 — Evolução: composição
  step(
    {
      emoji: "🥧",
      title: "De onde sai seu dinheiro?",
      body: "Barras empilhadas mostram quais categorias pesam mais no orçamento. As surpresas aqui são instrutivas! 😅",
      accent: CYN,
    },
    '[data-tour="evolucao-chart-composicao"]',
  ),

  // 21 — Evolução: comprometido
  step(
    {
      emoji: "🎯",
      title: "Meta de comprometimento",
      body: "Abaixo de 85% da renda? Tranquilo! Acima? Hora de rever os gastos. A linha vermelha nunca mente.",
      accent: CYN,
    },
    '[data-tour="evolucao-chart-comprometido"]',
  ),

  // 22 — Cartões: banner
  step(
    {
      emoji: "💳",
      title: "Visão geral dos cartões",
      body: "Fatura total, limite disponível e % de uso global. A saúde do seu crédito num único relance.",
      accent: PNK,
    },
    '[data-tour="cartoes-summary-banner"]',
  ),

  // 23 — Cartões: grid
  step(
    {
      emoji: "🃏",
      title: "Seus cartões de crédito",
      body: "Clique em qualquer cartão para ver assinaturas, parcelamentos e gastos avulsos daquele mês.",
      accent: PNK,
    },
    '[data-tour="cartoes-grid"]',
  ),

  // 24 — Cartões: FAB
  step(
    {
      emoji: "➕",
      title: "Adicionar cartão",
      body: "Cadastre com limite, dia de vencimento e cor personalizada. Organize tudo em segundos! 🌈",
      accent: PNK,
    },
    '[data-tour="cartoes-fab"]',
    "left",
  ),
];
