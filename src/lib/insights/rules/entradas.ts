import { Insight } from "@/lib/insights/types";
import { formatBRL } from "@/lib/utils/currency";

export interface EntradaInsightItem {
  tipo: "FIXA" | "VARIAVEL";
  valor: string;
  ativo: boolean;
}

export function analyzeEntradas(
  items: EntradaInsightItem[],
  totalMensal: number
): Insight[] {
  const insights: Insight[] = [];
  const ativos = items.filter((i) => i.ativo);
  const total = items.length;
  const fixas = ativos.filter((i) => i.tipo === "FIXA");
  const variaveis = ativos.filter((i) => i.tipo === "VARIAVEL");

  if (total === 0) {
    insights.push({
      id: "ent-vazio",
      level: "info",
      priority: 1,
      title: "Nenhuma entrada cadastrada",
      body: "Cadastre suas fontes de renda (salário, freelance, etc.) para que a Fotografia Financeira funcione corretamente.",
      action: "Adicionar entrada",
      actionHref: "/entradas",
    });
    return insights;
  }

  // Nenhuma entrada ativa
  if (ativos.length === 0) {
    insights.push({
      id: "ent-todos-inativos",
      level: "danger",
      priority: 1,
      title: "Todas as entradas estão inativas",
      body: "Sem entradas ativas, o planejamento não reflete sua renda real. Ative ao menos uma fonte de receita.",
    });
    return insights;
  }

  // 100% variável — risco
  if (fixas.length === 0 && variaveis.length > 0) {
    insights.push({
      id: "ent-sem-fixa",
      level: "warning",
      priority: 10,
      title: "Renda 100% variável",
      body: "Toda a sua renda vem de fontes variáveis. Isso aumenta o risco de imprevistos — considere criar uma reserva de emergência robusta.",
    });
  }

  // Diversificação positiva
  if (fixas.length >= 1 && variaveis.length >= 1) {
    insights.push({
      id: "ent-diversificado",
      level: "success",
      priority: 30,
      title: "Renda bem diversificada",
      body: `Você tem ${fixas.length} fonte(s) fixa(s) e ${variaveis.length} variável(is), o que traz estabilidade e potencial de crescimento.`,
      metric: formatBRL(totalMensal),
    });
  }

  // Concentração excessiva em uma fonte
  if (ativos.length >= 2) {
    const valores = ativos.map((i) => parseFloat(i.valor));
    const maior = Math.max(...valores);
    if (totalMensal > 0 && maior / totalMensal > 0.85) {
      insights.push({
        id: "ent-concentracao",
        level: "warning",
        priority: 11,
        title: "Renda muito concentrada",
        body: `Uma única fonte representa mais de 85% da sua renda (${formatBRL(maior)}). Perder essa fonte seria crítico — diversifique quando possível.`,
        metric: `${((maior / totalMensal) * 100).toFixed(0)}%`,
      });
    }
  }

  // Entradas inativas coexistindo com ativas — lembrete
  const inativos = items.filter((i) => !i.ativo);
  if (inativos.length > 0 && ativos.length > 0) {
    insights.push({
      id: "ent-inativos",
      level: "tip",
      priority: 40,
      title: `${inativos.length} entrada(s) inativa(s)`,
      body: "Você tem fontes de renda inativas. Se alguma voltou a ser recorrente, ative-a para manter o planejamento preciso.",
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
