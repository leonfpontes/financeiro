import { Insight } from "@/lib/insights/types";
import { formatBRL } from "@/lib/utils/currency";

export interface MesInsightData {
  mesAno: string;
  hasSnapshot: boolean;
  entradas: number;
  totalGastos: number;
  totalSaidas: number;
  disponivel: number;
  comprometidoPercent: number;
  margem: number;
}

export function analyzeEvolucao(serie: MesInsightData[]): Insight[] {
  const insights: Insight[] = [];
  const comSnapshot = serie.filter((m) => m.hasSnapshot);

  if (comSnapshot.length < 2) {
    insights.push({
      id: "evo-sem-dados",
      level: "info",
      priority: 1,
      title: "Poucos dados para analisar",
      body: "Para ver tendências significativas, você precisa de ao menos 2 meses com planejamento configurado.",
    });
    return insights;
  }

  const recent = comSnapshot.slice(-3); // últimos 3 meses com dados
  const last = recent[recent.length - 1];
  const prev = recent.length >= 2 ? recent[recent.length - 2] : null;

  // Tendência de deterioração — comprometimento subindo
  if (prev && last.comprometidoPercent > prev.comprometidoPercent + 10) {
    const delta = (last.comprometidoPercent - prev.comprometidoPercent).toFixed(0);
    insights.push({
      id: "evo-deterioracao",
      level: "danger",
      priority: 1,
      title: "Comprometimento em alta",
      body: `O comprometimento subiu ${delta} p.p. em relação ao mês anterior. Se a tendência continuar, o orçamento ficará comprometido em breve.`,
      metric: `+${delta} p.p.`,
    });
  }

  // Disponível negativo recorrente (≥2 dos últimos 3 meses)
  const negativos = recent.filter((m) => m.disponivel < 0);
  if (negativos.length >= 2) {
    insights.push({
      id: "evo-negativo-recorrente",
      level: "danger",
      priority: 2,
      title: "Déficit recorrente",
      body: `Em ${negativos.length} dos últimos ${recent.length} meses o disponível ficou negativo. É urgente revisar estrutura de gastos ou aumentar renda.`,
      metric: `${negativos.length}/${recent.length} meses`,
      action: "Ver gastos",
      actionHref: "/gastos",
    });
  }

  // Renda em queda por 2+ meses
  if (comSnapshot.length >= 3) {
    const ultimos3 = comSnapshot.slice(-3);
    const rendaCaindo =
      ultimos3[0].entradas > ultimos3[1].entradas &&
      ultimos3[1].entradas > ultimos3[2].entradas;
    if (rendaCaindo) {
      insights.push({
        id: "evo-renda-queda",
        level: "warning",
        priority: 10,
        title: "Renda em queda nos últimos meses",
        body: "Suas entradas planejadas diminuíram por 3 meses consecutivos. Revise suas fontes de renda e atualize o cadastro.",
        action: "Ver entradas",
        actionHref: "/entradas",
      });
    }
  }

  // Gastos crescendo mais rápido que a renda
  if (prev && last.entradas > 0 && prev.entradas > 0) {
    const crescGastos = last.totalGastos / prev.totalGastos - 1;
    const crescRenda = last.entradas / prev.entradas - 1;
    if (crescGastos > crescRenda + 0.05 && crescGastos > 0.05) {
      insights.push({
        id: "evo-gastos-crescem",
        level: "warning",
        priority: 11,
        title: "Gastos crescendo mais que a renda",
        body: `Os gastos cresceram mais rápido que a renda no último mês. Fique de olho para que a diferença não se acumule.`,
        metric: `+${(crescGastos * 100).toFixed(0)}% gastos`,
      });
    }
  }

  // Tendência de melhora — comprometimento caindo
  if (prev && last.comprometidoPercent < prev.comprometidoPercent - 5 && last.comprometidoPercent < 70) {
    insights.push({
      id: "evo-melhora",
      level: "success",
      priority: 30,
      title: "Comprometimento caindo",
      body: `O comprometimento reduziu ${(prev.comprometidoPercent - last.comprometidoPercent).toFixed(0)} p.p. em relação ao mês anterior. Boa evolução!`,
      metric: `${last.comprometidoPercent.toFixed(0)}%`,
    });
  }

  // Disponível positivo e estável
  const todosPositivos = recent.every((m) => m.disponivel >= 0);
  if (todosPositivos && recent.length >= 2 && last.comprometidoPercent < 75) {
    insights.push({
      id: "evo-estavel",
      level: "success",
      priority: 31,
      title: "Planejamento estável",
      body: `Nos últimos ${recent.length} meses analisados o disponível se manteve positivo. Continue assim e use o excedente para acelerar metas.`,
    });
  }

  // Média de comprometimento para dica
  const avgComprometido =
    comSnapshot.reduce((s, m) => s + m.comprometidoPercent, 0) / comSnapshot.length;
  if (avgComprometido < 60 && comSnapshot.length >= 4) {
    insights.push({
      id: "evo-media-boa",
      level: "tip",
      priority: 40,
      title: `Média de ${avgComprometido.toFixed(0)}% comprometido`,
      body: `Sua média histórica está abaixo de 60%. Considere definir metas mais ambiciosas de investimento ou aceleração de dívidas.`,
      metric: `${avgComprometido.toFixed(0)}%`,
      action: "Ver compromissos",
      actionHref: "/compromissos",
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
