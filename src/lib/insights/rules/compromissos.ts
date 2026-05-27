import { Insight } from "@/lib/insights/types";
import { formatBRL } from "@/lib/utils/currency";

export interface CompromissoInsightItem {
  tipo: "DIVIDA" | "INVESTIMENTO" | "SONHO";
  valorMensal: string;
  ativo: boolean;
}

export function analyzeCompromissos(
  items: CompromissoInsightItem[],
  totalEntradas: number
): Insight[] {
  const insights: Insight[] = [];
  const ativos = items.filter((i) => i.ativo);
  const dividas = ativos.filter((i) => i.tipo === "DIVIDA");
  const investimentos = ativos.filter((i) => i.tipo === "INVESTIMENTO");
  const sonhos = ativos.filter((i) => i.tipo === "SONHO");

  const totalDividas = dividas.reduce((s, c) => s + parseFloat(c.valorMensal), 0);
  const totalInvest = investimentos.reduce((s, c) => s + parseFloat(c.valorMensal), 0);
  const totalSonhos = sonhos.reduce((s, c) => s + parseFloat(c.valorMensal), 0);

  if (ativos.length === 0 && items.length === 0) {
    insights.push({
      id: "cmp-vazio",
      level: "info",
      priority: 1,
      title: "Nenhum compromisso cadastrado",
      body: "Cadastre suas dívidas, investimentos e sonhos para ter um planejamento financeiro completo.",
      action: "Adicionar compromisso",
      actionHref: "/compromissos",
    });
    return insights;
  }

  // Dívidas > 30% da renda
  if (totalEntradas > 0 && totalDividas / totalEntradas > 0.3) {
    insights.push({
      id: "cmp-divida-alta",
      level: "danger",
      priority: 1,
      title: "Endividamento excessivo",
      body: `Suas dívidas consomem ${((totalDividas / totalEntradas) * 100).toFixed(0)}% da renda. O limite saudável é 30%. Priorize quitar as de maior juros primeiro.`,
      metric: `${((totalDividas / totalEntradas) * 100).toFixed(0)}%`,
    });
  } else if (totalEntradas > 0 && totalDividas / totalEntradas > 0.2) {
    insights.push({
      id: "cmp-divida-moderada",
      level: "warning",
      priority: 10,
      title: "Atenção com dívidas",
      body: `Dívidas em ${((totalDividas / totalEntradas) * 100).toFixed(0)}% da renda — próximo ao limite recomendado de 30%. Evite assumir novos compromissos.`,
      metric: `${((totalDividas / totalEntradas) * 100).toFixed(0)}%`,
    });
  }

  // Sem nenhum investimento
  if (investimentos.length === 0 && ativos.length > 0) {
    insights.push({
      id: "cmp-sem-investimento",
      level: "warning",
      priority: 11,
      title: "Nenhum investimento ativo",
      body: "Não há investimentos no seu planejamento. Mesmo que seja pouco, comece a separar um valor mensal para construir patrimônio.",
      action: "Adicionar investimento",
      actionHref: "/compromissos",
    });
  }

  // Investimento saudável (≥ 10% da renda)
  if (totalEntradas > 0 && totalInvest / totalEntradas >= 0.1) {
    insights.push({
      id: "cmp-invest-bom",
      level: "success",
      priority: 30,
      title: "Boa taxa de investimento",
      body: `Você está investindo ${((totalInvest / totalEntradas) * 100).toFixed(0)}% da renda — acima da meta mínima de 10%. Excelente hábito!`,
      metric: `${((totalInvest / totalEntradas) * 100).toFixed(0)}%`,
    });
  }

  // Sonhos sem investimento — dica de alinhamento
  if (sonhos.length > 0 && investimentos.length === 0) {
    insights.push({
      id: "cmp-sonho-sem-invest",
      level: "tip",
      priority: 41,
      title: "Sonhos precisam de investimento",
      body: `Você tem ${sonhos.length} sonho(s) cadastrado(s) (${formatBRL(totalSonhos)}/mês), mas nenhum investimento ativo. Considere criar um investimento dedicado a cada meta.`,
    });
  }

  // Dívidas sendo quitadas (positivo)
  if (dividas.length > 0 && totalEntradas > 0 && totalDividas / totalEntradas <= 0.2) {
    insights.push({
      id: "cmp-divida-ok",
      level: "info",
      priority: 35,
      title: "Dívidas dentro do limite",
      body: `${((totalDividas / totalEntradas) * 100).toFixed(0)}% da renda em dívidas — dentro da faixa segura. Continue quitando para liberar renda mais cedo.`,
      metric: formatBRL(totalDividas),
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
