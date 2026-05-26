import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { GastoTipo, PeriodoInput } from "@/generated/prisma";
import { FaturaService } from "@/services/fatura.service";

export const dynamic = "force-dynamic";

const SEMANAS_MES = 52 / 12; // ~4.333
const faturaSvc = new FaturaService();

function gastoMensalCalculado(valor: number, tipo: GastoTipo, periodoInput: PeriodoInput | null, mesesOcorrencia: number[], mesAtualNumero: number): number {
  if (tipo === GastoTipo.FIXO) return valor;
  if (tipo === GastoTipo.VARIAVEL) {
    if (periodoInput === PeriodoInput.SEMANAL) return valor * SEMANAS_MES;
    return valor;
  }
  // SAZONAL: média mensal
  return (valor * mesesOcorrencia.length) / 12;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { searchParams } = new URL(req.url);
  const mesAno = searchParams.get("mesAno");
  if (!mesAno || !/^\d{4}-\d{2}$/.test(mesAno)) {
    return NextResponse.json(fail("VALIDATION", "Parâmetro mesAno inválido (esperado YYYY-MM)", 400), { status: 400 });
  }

  const mesNumero = parseInt(mesAno.split("-")[1], 10);

  // Mês atual no servidor (ex: "2026-05")
  const hoje = new Date();
  const mesAnoAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const isMesAtual = mesAno === mesAnoAtual;

  const [year, month] = mesAno.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay  = new Date(Date.UTC(year, month, 0));

  const [entradas, gastos, compromissos, config, realizados, snapshotExistente, cartoesResumo] = await Promise.all([
    prisma.entrada.findMany({ where: { userId, ativo: true }, orderBy: { createdAt: "asc" } }),
    prisma.gasto.findMany({
      where: {
        userId,
        ativo: true,
        dataInicio: { lte: lastDay },
        OR: [{ dataFim: null }, { dataFim: { gte: firstDay } }],
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.compromisso.findMany({ where: { userId, ativo: true }, orderBy: { createdAt: "asc" } }),
    prisma.configUsuario.findUnique({ where: { userId } }),
    prisma.realizadoMensal.findMany({ where: { userId, mesAno } }),
    prisma.snapshotMensal.findUnique({ where: { userId_mesAno: { userId, mesAno } } }),
    faturaSvc.getFaturaResumoTodosCartoes(userId, mesAno),
  ]);

  const margemPercent = config ? Number(config.margemPercent) : 15;
  const tetoCreditCard = config?.tetoCreditCard ? Number(config.tetoCreditCard) : null;

  // Entradas
  const totalEntradas = entradas.reduce((acc, e) => acc + Number(e.valor), 0);

  // Compromissos
  const totalCompromissos = compromissos.reduce((acc, c) => acc + Number(c.valorMensal), 0);

  // Gastos por tipo
  const fixos = gastos.filter(g => g.tipo === GastoTipo.FIXO);
  const variaveis = gastos.filter(g => g.tipo === GastoTipo.VARIAVEL);
  const sazonais = gastos.filter(g => g.tipo === GastoTipo.SAZONAL);

  const totalFixos = fixos.reduce((acc, g) => acc + Number(g.valor), 0);

  const totalVariaveisMensal = variaveis.reduce((acc, g) => {
    const v = Number(g.valor);
    return acc + (g.periodoInput === PeriodoInput.SEMANAL ? v * SEMANAS_MES : v);
  }, 0);
  const totalVariaveisSemanal = variaveis.reduce((acc, g) => {
    const v = Number(g.valor);
    return acc + (g.periodoInput === PeriodoInput.SEMANAL ? v : v / SEMANAS_MES);
  }, 0);

  const totalSazonaisAnual = sazonais.reduce((acc, g) => acc + Number(g.valor) * g.mesesOcorrencia.length, 0);
  const totalSazonaisMensal = totalSazonaisAnual / 12;
  const sazonaisAlertaMes = sazonais.filter(g => g.mesesOcorrencia.includes(mesNumero));

  const totalCartoes = cartoesResumo.reduce((s, c) => s + c.total, 0);

  // Margem
  const margemValorLive = (margemPercent / 100) * totalEntradas;

  const hasData = entradas.length > 0 || gastos.length > 0 || compromissos.length > 0;

  // ── Snapshot: congela o planejado para meses passados apenas ─────────────
  // Mês atual: sempre ao vivo (dados ainda estão sendo lançados)
  // Meses passados: cria snapshot na primeira abertura e usa ele para preservar o histórico
  let snap = !isMesAtual ? snapshotExistente : null;
  if (!isMesAtual && !snap && hasData) {
    snap = await prisma.snapshotMensal.create({
      data: {
        userId,
        mesAno,
        entradas: totalEntradas,
        compromissos: totalCompromissos,
        gastosFixos: totalFixos,
        gastosVariaveis: totalVariaveisMensal,
        gastosSazonais: totalSazonaisMensal,
        margem: margemValorLive,
        margemPercent,
        gastosCartoes: totalCartoes,
      },
    });
  }

  // Valores planejados: snapshot (imutável) se existir, senão ao vivo
  const pEntradas        = snap ? Number(snap.entradas)        : totalEntradas;
  const pCompromissos    = snap ? Number(snap.compromissos)    : totalCompromissos;
  const pGastosFixos     = snap ? Number(snap.gastosFixos)     : totalFixos;
  const pGastosVariaveis = snap ? Number(snap.gastosVariaveis) : totalVariaveisMensal;
  const pGastosSazonais  = snap ? Number(snap.gastosSazonais)  : totalSazonaisMensal;
  const pMargem          = snap ? Number(snap.margem)          : margemValorLive;
  const pMargemPercent   = snap ? Number(snap.margemPercent)   : margemPercent;
  const pGastosCartoes   = snap ? Number(snap.gastosCartoes)   : totalCartoes;

  // Disponível
  const disponivel = pEntradas - pCompromissos - pGastosFixos - pGastosVariaveis - pGastosSazonais - pMargem - pGastosCartoes;

  // Percentual comprometido
  const comprometidoPercent = pEntradas > 0 ? ((pEntradas - disponivel) / pEntradas) * 100 : 0;

  // Realizados map
  const realizadoMap: Record<string, number | null> = {
    ENTRADAS: null, GASTOS_FIXOS: null, GASTOS_VARIAVEIS: null, GASTOS_SAZONAIS: null, COMPROMISSOS: null,
  };
  for (const r of realizados) {
    realizadoMap[r.grupo] = Number(r.valorRealizado);
  }

  return NextResponse.json(ok({
    entradas:     { items: entradas,     totalPlanejado: pEntradas },
    compromissos: { items: compromissos, totalMensal: pCompromissos },
    gastos: {
      fixos:     { items: fixos,     total: pGastosFixos },
      variaveis: { items: variaveis, totalSemanal: totalVariaveisSemanal, totalMensal: pGastosVariaveis },
      sazonais:  { items: sazonais,  totalAnual: totalSazonaisAnual, totalMensal: pGastosSazonais, alertaMes: sazonaisAlertaMes },
    },
    config: { margemPercent: pMargemPercent, tetoCreditCard, notasPlanoAcao: config?.notasPlanoAcao ?? null },
    margem: { percent: pMargemPercent, valor: pMargem },
    disponivel,
    comprometidoPercent,
    realizado: realizadoMap,
    hasData,
    isSnapshot: !!snap,
    cartoes: {
      total: pGastosCartoes,
      teto: tetoCreditCard,
      items: cartoesResumo,
    },
  }));
}
