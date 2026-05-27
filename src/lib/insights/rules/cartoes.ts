import { Insight } from "@/lib/insights/types";
import { formatBRL } from "@/lib/utils/currency";

export interface CartaoInsightItem {
  id: string;
  nome: string;
  limite: number;
  ativo: boolean;
  faturaMesAtual: number;
}

export function analyzeCartoes(
  cartoes: CartaoInsightItem[],
  tetoCreditCard: number | null
): Insight[] {
  const insights: Insight[] = [];
  const ativos = cartoes.filter((c) => c.ativo);

  if (cartoes.length === 0) {
    insights.push({
      id: "cat-vazio",
      level: "info",
      priority: 1,
      title: "Nenhum cartão cadastrado",
      body: "Cadastre seus cartões de crédito para acompanhar assinaturas, parcelamentos e faturas.",
      action: "Adicionar cartão",
      actionHref: "/cartoes",
    });
    return insights;
  }

  const totalFatura = ativos.reduce((s, c) => s + c.faturaMesAtual, 0);
  const totalLimite = ativos.reduce((s, c) => s + c.limite, 0);

  // Limite individual quase estourado (> 90%)
  const quaseEstourados = ativos.filter(
    (c) => c.limite > 0 && c.faturaMesAtual / c.limite > 0.9
  );
  if (quaseEstourados.length > 0) {
    const nomes = quaseEstourados.map((c) => c.nome).join(", ");
    insights.push({
      id: "cat-limite-critico",
      level: "danger",
      priority: 1,
      title: `${quaseEstourados.length} cartão(ões) com limite crítico`,
      body: `${nomes}: uso acima de 90% do limite. Isso pode impactar sua pontuação de crédito e dificultar novos gastos.`,
      metric: `${quaseEstourados.length} cartão(ões)`,
    });
  }

  // Teto global ultrapassado
  if (tetoCreditCard && totalFatura > tetoCreditCard) {
    insights.push({
      id: "cat-teto-global",
      level: "danger",
      priority: 2,
      title: "Teto de crédito global ultrapassado",
      body: `Fatura total (${formatBRL(totalFatura)}) acima do teto configurado (${formatBRL(tetoCreditCard)}). Ajuste gastos ou revise o teto nas configurações.`,
      metric: formatBRL(totalFatura),
    });
  }

  // Uso entre 70–90%
  const usoPesado = ativos.filter(
    (c) => c.limite > 0 && c.faturaMesAtual / c.limite > 0.7 && c.faturaMesAtual / c.limite <= 0.9
  );
  if (usoPesado.length > 0 && quaseEstourados.length === 0) {
    insights.push({
      id: "cat-uso-pesado",
      level: "warning",
      priority: 10,
      title: "Uso elevado do limite",
      body: `${usoPesado.length} cartão(ões) com uso entre 70% e 90% do limite. Cuidado para não ultrapassar no restante do mês.`,
      metric: `${usoPesado.length} cartão(ões)`,
    });
  }

  // Limite total vs fatura — saúde geral
  if (totalLimite > 0) {
    const usoPct = (totalFatura / totalLimite) * 100;
    if (usoPct <= 30 && ativos.length >= 1) {
      insights.push({
        id: "cat-uso-saudavel",
        level: "success",
        priority: 30,
        title: "Uso saudável do crédito",
        body: `Fatura atual corresponde a ${usoPct.toFixed(0)}% do limite total disponível. O ideal é manter abaixo de 30% para saúde do crédito.`,
        metric: `${usoPct.toFixed(0)}% do limite`,
      });
    }
  }

  // Múltiplos cartões — dica de organização
  if (ativos.length >= 3) {
    insights.push({
      id: "cat-multiplos",
      level: "tip",
      priority: 40,
      title: "Vários cartões para gerenciar",
      body: `Com ${ativos.length} cartões ativos, vale centralizar os dados da fatura regularmente para evitar surpresas na virada do mês.`,
      metric: `${ativos.length} cartões`,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
