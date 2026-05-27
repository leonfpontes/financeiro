import type { StepType } from "@reactour/tour";
import { step } from "./_helper";

const IND = "#6366f1";

export const fotografiaSteps: StepType[] = [
  step(
    { emoji: "🎉", title: "Bem-vindo ao Financeiro!", body: "Sou seu guia e vou te mostrar tudo em menos de 2 minutos. Preparado para dominar suas finanças? 🚀", accent: IND },
    "body",
    "center",
  ),
  step(
    { emoji: "🗺️", title: "Sua central de navegação", body: "Aqui ficam todas as seções do app — de Fotografia a Cartões. Um clique e você está lá!", accent: IND },
    '[data-tour="sidebar-nav"]',
    "right",
  ),
  step(
    { emoji: "📅", title: "Viaje no tempo financeiro", body: "Use as setas para navegar entre os meses. Passado, presente ou futuro — cada mês é uma fotografia única!", accent: IND },
    '[data-tour="fotografia-mes-nav"]',
  ),
  step(
    { emoji: "💰", title: "O número que mais importa", body: "Quanto sobra depois de pagar tudo? Verde = ótimo. Vermelho = hora de rever os gastos. Mantenha sempre positivo! 🟢", accent: IND },
    '[data-tour="fotografia-hero-disponivel"]',
  ),
  step(
    { emoji: "📊", title: "Os 6 pilares do orçamento", body: "Entradas, compromissos, gastos fixos, variáveis, sazonais e margem. Juntos formam a fórmula do seu mês.", accent: IND },
    '[data-tour="fotografia-kpi-cards"]',
  ),
  step(
    { emoji: "🧮", title: "A matemática do seu dinheiro", body: "Entradas − obrigações − gastos = liberdade financeira. Quanto maior o resultado, melhor a saúde do bolso! 🎯", accent: IND },
    '[data-tour="fotografia-formula"]',
  ),
  step(
    { emoji: "🤖", title: "Seu consultor automático", body: "Análises inteligentes que detectam riscos e oportunidades no seu orçamento em tempo real. Nem um banco faz isso!", accent: IND },
    '[data-tour="fotografia-insights"]',
  ),
  step(
    { emoji: "💳", title: "Fatura no resumo", body: "Veja o total da fatura e o percentual do limite usado — sem precisar abrir a aba de cartões. Praticidade máxima!", accent: IND },
    '[data-tour="fotografia-cartoes-resumo"]',
  ),
  step(
    { emoji: "📝", title: "Seu diário financeiro", body: "Escreva metas, lembretes e decisões. Seu eu do futuro vai agradecer cada anotação feita aqui. 💌", accent: IND },
    '[data-tour="fotografia-plano-acao"]',
  ),
];
