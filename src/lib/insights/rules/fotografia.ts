import { Insight } from "@/lib/insights/types";
import { formatBRL } from "@/lib/utils/currency";

interface Item { ativo: boolean; nome: string; valor?: string; valorMensal?: string }
interface ItemSazonal extends Item { mesesOcorrencia: number[] }

export interface FotografiaInsightData {
  entradas: { totalPlanejado: number };
  compromissos: { totalMensal: number };
  gastos: {
    fixos: { total: number };
    variaveis: { totalMensal: number };
    sazonais: { totalMensal: number; alertaMes: ItemSazonal[] };
  };
  config: { margemPercent: number; tetoCreditCard: number | null };
  margem: { valor: number };
  disponivel: number;
  comprometidoPercent: number;
  realizado: Record<string, number | null>;
  cartoes?: { total: number; teto: number | null };
}

export function analyzeFotografia(data: FotografiaInsightData): Insight[] {
  const insights: Insight[] = [];
  const {
    entradas,
    gastos,
    margem,
    disponivel,
    comprometidoPercent,
    config,
    realizado,
    cartoes,
  } = data;

  const renda = entradas.totalPlanejado;

  // ── DANGER ──────────────────────────────────────────────────────────────

  if (disponivel < 0) {
    insights.push({
      id: "foto-negativo",
      level: "danger",
      priority: 1,
      title: "Orçamento no vermelho",
      body: `Suas saídas superam as entradas em ${formatBRL(Math.abs(disponivel))}. Revise gastos variáveis ou busque cortar itens não essenciais antes do fim do mês.`,
      metric: formatBRL(disponivel),
      action: "Ver gastos",
      actionHref: "/gastos",
    });
  }

  if (comprometidoPercent > 90) {
    insights.push({
      id: "foto-comprometimento-critico",
      level: "danger",
      priority: 2,
      title: "Comprometimento crítico",
      body: `${comprometidoPercent.toFixed(0)}% da sua renda está comprometida. Qualquer imprevisto coloca o mês em risco. Foco imediato em cortar variáveis.`,
      metric: `${comprometidoPercent.toFixed(0)}%`,
      action: "Ver gastos",
      actionHref: "/gastos",
    });
  }

  if (cartoes && cartoes.teto && cartoes.total > cartoes.teto) {
    insights.push({
      id: "foto-cartao-teto",
      level: "danger",
      priority: 3,
      title: "Teto de crédito ultrapassado",
      body: `Sua fatura de cartões (${formatBRL(cartoes.total)}) está acima do teto configurado (${formatBRL(cartoes.teto)}). Revise os lançamentos para evitar comprometer o próximo mês.`,
      metric: formatBRL(cartoes.total),
      action: "Ver cartões",
      actionHref: "/cartoes",
    });
  }

  // ── WARNING ─────────────────────────────────────────────────────────────

  if (comprometidoPercent > 75 && comprometidoPercent <= 90) {
    insights.push({
      id: "foto-comprometimento-alto",
      level: "warning",
      priority: 10,
      title: "Atenção: orçamento apertado",
      body: `Com ${comprometidoPercent.toFixed(0)}% da renda comprometida, sua margem de segurança é pequena. Pequenos imprevistos podem desequilibrar o mês.`,
      metric: `${comprometidoPercent.toFixed(0)}%`,
    });
  }

  if (renda > 0 && cartoes && cartoes.total / renda > 0.3) {
    const pct = ((cartoes.total / renda) * 100).toFixed(0);
    insights.push({
      id: "foto-cartao-percentual",
      level: "warning",
      priority: 11,
      title: "Cartões acima de 30% da renda",
      body: `${pct}% da sua renda mensal está sendo consumida pelos cartões. O ideal é manter abaixo de 20% para preservar liquidez.`,
      metric: `${pct}% da renda`,
      action: "Ver cartões",
      actionHref: "/cartoes",
    });
  }

  // Gastos reais acima do planejado
  const totalGastosPlanejado =
    gastos.fixos.total + gastos.variaveis.totalMensal + gastos.sazonais.totalMensal;
  const realizadoGastos =
    (realizado["GASTOS_FIXOS"] ?? 0) +
    (realizado["GASTOS_VARIAVEIS"] ?? 0) +
    (realizado["GASTOS_SAZONAIS"] ?? 0);
  if (realizadoGastos > 0 && totalGastosPlanejado > 0 && realizadoGastos > totalGastosPlanejado * 1.15) {
    const excesso = ((realizadoGastos / totalGastosPlanejado - 1) * 100).toFixed(0);
    insights.push({
      id: "foto-gastos-acima",
      level: "warning",
      priority: 12,
      title: "Gastos reais acima do planejado",
      body: `Você está gastando ${excesso}% a mais do que planejou. Pode ser hora de ajustar o orçamento para refletir a realidade.`,
      metric: `+${excesso}%`,
      action: "Ver gastos",
      actionHref: "/gastos",
    });
  }

  // Receita real abaixo do planejado
  const realizadoEntradas = realizado["ENTRADAS"] ?? 0;
  if (realizadoEntradas > 0 && renda > 0 && realizadoEntradas < renda * 0.9) {
    const deficit = (((renda - realizadoEntradas) / renda) * 100).toFixed(0);
    insights.push({
      id: "foto-entradas-abaixo",
      level: "warning",
      priority: 13,
      title: "Receita abaixo do esperado",
      body: `Suas entradas realizadas estão ${deficit}% abaixo do planejado. Revise se há receitas variáveis que precisam ser ajustadas.`,
      metric: `-${deficit}%`,
      action: "Ver entradas",
      actionHref: "/entradas",
    });
  }

  // ── INFO ────────────────────────────────────────────────────────────────

  if (gastos.sazonais.alertaMes.length > 0) {
    const nomes = gastos.sazonais.alertaMes.map((g) => g.nome).join(", ");
    insights.push({
      id: "foto-sazonal",
      level: "info",
      priority: 20,
      title: `${gastos.sazonais.alertaMes.length} despesa(s) sazonal(is) este mês`,
      body: `Itens previstos: ${nomes}. Certifique-se de ter o valor reservado para não comprometer o fluxo.`,
      metric: `${gastos.sazonais.alertaMes.length} ${gastos.sazonais.alertaMes.length === 1 ? "item" : "itens"}`,
    });
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────

  if (comprometidoPercent < 50 && disponivel >= 0) {
    insights.push({
      id: "foto-excelente",
      level: "success",
      priority: 30,
      title: "Excelente controle financeiro",
      body: `Apenas ${comprometidoPercent.toFixed(0)}% da sua renda está comprometida. Você tem uma folga saudável — considere acelerar investimentos ou metas.`,
      metric: `${comprometidoPercent.toFixed(0)}%`,
      action: "Ver compromissos",
      actionHref: "/compromissos",
    });
  }

  // ── TIP ──────────────────────────────────────────────────────────────────

  if (margem.valor > 0 && comprometidoPercent < 70 && disponivel > 0) {
    insights.push({
      id: "foto-margem-extra",
      level: "tip",
      priority: 40,
      title: "Margem disponível para alocar",
      body: `Você tem ${formatBRL(margem.valor)} de margem reservada além do disponível. Se não houver imprevistos esperados, considere direcionar parte para uma meta financeira.`,
      metric: formatBRL(margem.valor),
      action: "Ver compromissos",
      actionHref: "/compromissos",
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
