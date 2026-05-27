import type { StepType } from "@reactour/tour";
import { step } from "./_helper";

const GRN = "#10b981";

export const entradasSteps: StepType[] = [
  step(
    { emoji: "💵", title: "Sua renda total ativa", body: "Soma automática de todas as fontes ativas. Inativou uma entrada? O total atualiza na hora — magia! ✨", accent: GRN },
    '[data-tour="entradas-total-card"]',
  ),
  step(
    { emoji: "📋", title: "Suas fontes de renda", body: "Salário, freela, aluguel... cada entrada tem tipo, valor e status. Toque em ⋮ para editar ou desativar.", accent: GRN },
    '[data-tour="entradas-list"]',
  ),
  step(
    { emoji: "➕", title: "Adicionar nova entrada", body: "Toque aqui para cadastrar uma nova fonte de renda. Em menos de 30 segundos está feito! ⚡", accent: GRN },
    '[data-tour="entradas-fab"]',
    "left",
  ),
];
