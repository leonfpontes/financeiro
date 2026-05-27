import type { StepType } from "@reactour/tour";
import { step } from "./_helper";

const PNK = "#ec4899";

export const cartoesSteps: StepType[] = [
  step(
    { emoji: "💳", title: "Visão geral dos cartões", body: "Fatura total, limite disponível e % de uso global. A saúde do seu crédito num único relance.", accent: PNK },
    '[data-tour="cartoes-summary-banner"]',
  ),
  step(
    { emoji: "🃏", title: "Seus cartões de crédito", body: "Clique em qualquer cartão para ver assinaturas, parcelamentos e gastos avulsos daquele mês.", accent: PNK },
    '[data-tour="cartoes-grid"]',
  ),
  step(
    { emoji: "➕", title: "Adicionar cartão", body: "Cadastre com limite, dia de vencimento e cor personalizada. Organize tudo em segundos! 🌈", accent: PNK },
    '[data-tour="cartoes-fab"]',
    "left",
  ),
];
