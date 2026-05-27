import type { StepType } from "@reactour/tour";
import { step } from "./_helper";

const CYN = "#06b6d4";

export const evolucaoSteps: StepType[] = [
  step(
    { emoji: "📉", title: "Médias do período", body: "Visão consolidada das suas médias de renda, gastos e disponível. Use os filtros 3M, 6M, 12M ou 24M.", accent: CYN },
    '[data-tour="evolucao-kpi-row"]',
  ),
  step(
    { emoji: "📈", title: "Fluxo de caixa", body: "Verde = entradas. Vermelho = saídas. Linha azul = o que sobrou. Quanto maior a diferença, mais saudável o bolso! 📐", accent: CYN },
    '[data-tour="evolucao-chart-fluxo"]',
  ),
  step(
    { emoji: "🥧", title: "De onde sai seu dinheiro?", body: "Barras empilhadas mostram quais categorias pesam mais no orçamento. As surpresas aqui são instrutivas! 😅", accent: CYN },
    '[data-tour="evolucao-chart-composicao"]',
  ),
  step(
    { emoji: "🎯", title: "Meta de comprometimento", body: "Abaixo de 85% da renda? Tranquilo! Acima? Hora de rever os gastos. A linha vermelha nunca mente.", accent: CYN },
    '[data-tour="evolucao-chart-comprometido"]',
  ),
];
