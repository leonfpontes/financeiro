import type { StepType } from "@reactour/tour";
import { step } from "./_helper";

const PUR = "#8b5cf6";

export const compromissosSteps: StepType[] = [
  step(
    { emoji: "📈", title: "Seu placar financeiro", body: "Dívidas, investimentos e sonhos lado a lado. Ideal para manter equilíbrio e visualizar o progresso de vida.", accent: PUR },
    '[data-tour="compromissos-metricas"]',
  ),
  step(
    { emoji: "🏦", title: "Seus compromissos", body: "Do financiamento ao fundo de emergência, da viagem dos sonhos ao investimento mensal — tudo organizado aqui.", accent: PUR },
    '[data-tour="compromissos-lista"]',
  ),
  step(
    { emoji: "✨", title: "Novo compromisso", body: "Cadastre uma dívida para monitorar, um investimento recorrente ou aquele sonho que você está perseguindo!", accent: PUR },
    '[data-tour="compromissos-fab"]',
    "left",
  ),
];
