import type { StepType } from "@reactour/tour";
import { step } from "./_helper";

const ORG = "#f97316";

export const gastosSteps: StepType[] = [
  step(
    { emoji: "🗂️", title: "3 tipos de despesa", body: "Fixo (todo mês), Variável (oscila) e Sazonal (só em meses específicos, como IPTU). Cada um no seu lugar certo.", accent: ORG },
    '[data-tour="gastos-tabs"]',
  ),
  step(
    { emoji: "💸", title: "Seus gastos cadastrados", body: "Cada item mostra o custo mensal estimado. Toque em ⋮ para editar ou expanda para ver mais detalhes.", accent: ORG },
    '[data-tour="gastos-list"]',
  ),
  step(
    { emoji: "➕", title: "Novo gasto", body: "Cadastre uma despesa com ícone personalizado — deixe seu orçamento com a sua identidade! 🎨", accent: ORG },
    '[data-tour="gastos-fab"]',
    "left",
  ),
];
