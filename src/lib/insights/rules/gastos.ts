import { Insight } from "@/lib/insights/types";
import { formatBRL } from "@/lib/utils/currency";

const SEMANAS_MES = 52 / 12;

export interface GastoInsightItem {
  tipo: "FIXO" | "VARIAVEL" | "SAZONAL";
  valor: string;
  periodoInput: "SEMANAL" | "MENSAL" | null;
  mesesOcorrencia: number[];
  ativo: boolean;
}

function gastoMensal(g: GastoInsightItem): number {
  const v = parseFloat(g.valor);
  if (g.tipo === "FIXO") return v;
  if (g.tipo === "VARIAVEL") return g.periodoInput === "SEMANAL" ? v * SEMANAS_MES : v;
  return (v * g.mesesOcorrencia.length) / 12;
}

export function analyzeGastos(
  items: GastoInsightItem[],
  totalEntradas: number
): Insight[] {
  const insights: Insight[] = [];
  const ativos = items.filter((i) => i.ativo);
  const fixos = ativos.filter((i) => i.tipo === "FIXO");
  const variaveis = ativos.filter((i) => i.tipo === "VARIAVEL");
  const sazonais = ativos.filter((i) => i.tipo === "SAZONAL");

  if (ativos.length === 0) {
    insights.push({
      id: "gst-vazio",
      level: "info",
      priority: 1,
      title: "Nenhum gasto ativo cadastrado",
      body: "Cadastre seus gastos mensais para que a Fotografia Financeira exiba o planejamento completo.",
      action: "Adicionar gasto",
      actionHref: "/gastos",
    });
    return insights;
  }

  const totalFixos = fixos.reduce((s, g) => s + gastoMensal(g), 0);
  const totalVarMensal = variaveis.reduce((s, g) => s + gastoMensal(g), 0);
  const totalGastos = totalFixos + totalVarMensal;

  // Gastos fixos > 60% da renda
  if (totalEntradas > 0 && totalFixos / totalEntradas > 0.6) {
    insights.push({
      id: "gst-fixo-alto",
      level: "danger",
      priority: 1,
      title: "Gastos fixos muito elevados",
      body: `Seus gastos fixos consomem ${((totalFixos / totalEntradas) * 100).toFixed(0)}% da renda. A regra do 50/30/20 sugere no máximo 50% para necessidades. Revise contratos fixos.`,
      metric: `${((totalFixos / totalEntradas) * 100).toFixed(0)}%`,
    });
  }

  // Total de gastos > 80% da renda
  if (totalEntradas > 0 && totalGastos / totalEntradas > 0.8) {
    insights.push({
      id: "gst-total-alto",
      level: "warning",
      priority: 10,
      title: "Gastos consomem grande parte da renda",
      body: `Entre fixos e variáveis, os gastos representam ${((totalGastos / totalEntradas) * 100).toFixed(0)}% da sua renda. Pouco espaço para compromissos e margem.`,
      metric: formatBRL(totalGastos),
    });
  }

  // Sazonais sem mês configurado
  const sazonaisSemMes = sazonais.filter((g) => g.mesesOcorrencia.length === 0);
  if (sazonaisSemMes.length > 0) {
    insights.push({
      id: "gst-sazonal-sem-mes",
      level: "warning",
      priority: 11,
      title: `${sazonaisSemMes.length} gasto(s) sazonal(is) sem mês definido`,
      body: "Gastos sazonais sem meses de ocorrência não são contabilizados no planejamento. Configure os meses para eles aparecerem na Fotografia.",
    });
  }

  // Bom equilíbrio fixo/variável
  if (
    totalEntradas > 0 &&
    totalFixos / totalEntradas <= 0.4 &&
    variaveis.length > 0 &&
    ativos.length >= 3
  ) {
    insights.push({
      id: "gst-equilibrado",
      level: "success",
      priority: 30,
      title: "Estrutura de gastos equilibrada",
      body: `Gastos fixos em ${((totalFixos / totalEntradas) * 100).toFixed(0)}% da renda — dentro da faixa saudável. Continue monitorando os variáveis.`,
      metric: `${((totalFixos / totalEntradas) * 100).toFixed(0)}% fixos`,
    });
  }

  // Dica: muitos gastos sem categoria (icone null)
  const semIcone = ativos.filter((g) => !(g as GastoInsightItem & { icone?: string | null }).icone);
  if (semIcone.length > ativos.length * 0.5 && ativos.length >= 4) {
    insights.push({
      id: "gst-sem-icone",
      level: "tip",
      priority: 40,
      title: "Adicione ícones para organizar",
      body: "Categorizar seus gastos com ícones facilita a identificação visual e o acompanhamento por área de vida.",
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
