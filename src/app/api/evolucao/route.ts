import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { GastoTipo, PeriodoInput } from "@/generated/prisma";
import { FaturaService } from "@/services/fatura.service";

export const dynamic = "force-dynamic";

const SEMANAS_MES = 52 / 12;

function calcGastoMensal(
  valor: number,
  tipo: GastoTipo,
  periodoInput: PeriodoInput | null,
  mesesOcorrencia: number[],
): number {
  if (tipo === GastoTipo.FIXO) return valor;
  if (tipo === GastoTipo.VARIAVEL) {
    return periodoInput === PeriodoInput.SEMANAL ? valor * SEMANAS_MES : valor;
  }
  return (valor * mesesOcorrencia.length) / 12;
}

function addMonths(yearMonth: string, n: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateRange(de: string, ate: string): string[] {
  const range: string[] = [];
  let cur = de;
  while (cur <= ate) {
    range.push(cur);
    cur = addMonths(cur, 1);
  }
  return range;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { searchParams } = new URL(req.url);
  const mesesParam = searchParams.get("meses");
  const deParam = searchParams.get("de");
  const ateParam = searchParams.get("ate");

  const mesAnoRegex = /^\d{4}-\d{2}$/;

  const hoje = new Date();
  const mesAnoAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

  let de: string;
  let ate: string;

  if (deParam && ateParam && mesAnoRegex.test(deParam) && mesAnoRegex.test(ateParam)) {
    de = deParam;
    ate = ateParam;
  } else {
    const meses = Math.min(24, Math.max(1, parseInt(mesesParam ?? "6", 10)));
    de = addMonths(mesAnoAtual, -(meses - 1));
    ate = mesAnoAtual;
  }

  const range = generateRange(de, ate);
  const incluiAtual = range.includes(mesAnoAtual);
  const faturaSvc = new FaturaService();

  const [snapshots, realizados, entradas, gastos, compromissos, config, cartoesAtual] = await Promise.all([
    prisma.snapshotMensal.findMany({
      where: { userId, mesAno: { in: range } },
    }),
    prisma.realizadoMensal.findMany({
      where: { userId, mesAno: { in: range } },
    }),
    prisma.entrada.findMany({ where: { userId, ativo: true } }),
    prisma.gasto.findMany({ where: { userId, ativo: true } }),
    prisma.compromisso.findMany({ where: { userId, ativo: true } }),
    prisma.configUsuario.findUnique({ where: { userId } }),
    incluiAtual
      ? faturaSvc.getFaturaResumoTodosCartoes(userId, mesAnoAtual)
      : Promise.resolve([]),
  ]);

  const totalCartoesAtual = cartoesAtual.reduce((s, c) => s + c.total, 0);

  const snapMap = new Map(snapshots.map((s) => [s.mesAno, s]));
  const realizadoMap = new Map<string, Record<string, number>>();
  for (const r of realizados) {
    if (!realizadoMap.has(r.mesAno)) realizadoMap.set(r.mesAno, {});
    realizadoMap.get(r.mesAno)![r.grupo] = Number(r.valorRealizado);
  }

  const margemPercent = config ? Number(config.margemPercent) : 15;

  const series = range
    .map((mesAno) => {
      const isAtual = mesAno === mesAnoAtual;

      // Meses passados sem snapshot = nunca foram registrados → excluir da série
      // (evita projetar dados atuais retroativamente em meses que estavam zerados)
      const snap = isAtual ? undefined : snapMap.get(mesAno);
      if (!isAtual && !snap) return null;

      let pEntradas: number;
      let pCompromissos: number;
      let pGastosFixos: number;
      let pGastosVariaveis: number;
      let pGastosSazonais: number;
      let pGastosCartoes: number;
      let pMargemPercent: number;

      if (snap) {
        pEntradas        = Number(snap.entradas);
        pCompromissos    = Number(snap.compromissos);
        pGastosFixos     = Number(snap.gastosFixos);
        pGastosVariaveis = Number(snap.gastosVariaveis);
        pGastosSazonais  = Number(snap.gastosSazonais);
        pGastosCartoes   = Number(snap.gastosCartoes);
        pMargemPercent   = Number(snap.margemPercent);
      } else {
        // Mês atual: sempre ao vivo
        const [year, month] = mesAno.split("-").map(Number);
        const firstDay = new Date(Date.UTC(year, month - 1, 1));
        const lastDay  = new Date(Date.UTC(year, month, 0));

        const activeGastos = gastos.filter((g) => {
          const start = new Date(g.dataInicio);
          const end = g.dataFim ? new Date(g.dataFim) : null;
          return start <= lastDay && (end === null || end >= firstDay);
        });

        pEntradas        = entradas.reduce((acc, e) => acc + Number(e.valor), 0);
        pCompromissos    = compromissos.reduce((acc, c) => acc + Number(c.valorMensal), 0);
        pGastosFixos     = activeGastos.filter((g) => g.tipo === GastoTipo.FIXO).reduce((acc, g) => acc + Number(g.valor), 0);
        pGastosVariaveis = activeGastos.filter((g) => g.tipo === GastoTipo.VARIAVEL).reduce((acc, g) => acc + calcGastoMensal(Number(g.valor), g.tipo, g.periodoInput, g.mesesOcorrencia), 0);
        pGastosSazonais  = activeGastos.filter((g) => g.tipo === GastoTipo.SAZONAL).reduce((acc, g) => acc + calcGastoMensal(Number(g.valor), g.tipo, g.periodoInput, g.mesesOcorrencia), 0);
        pGastosCartoes   = totalCartoesAtual;
        pMargemPercent   = margemPercent;
      }

      const pMargem     = (pMargemPercent / 100) * pEntradas;
      const totalGastos = pCompromissos + pGastosFixos + pGastosVariaveis + pGastosSazonais + pGastosCartoes;
      const totalSaidas = totalGastos + pMargem;
      const disponivel  = pEntradas - totalSaidas;
      const comprometidoPercent = pEntradas > 0 ? (totalSaidas / pEntradas) * 100 : 0;

      const real = realizadoMap.get(mesAno) ?? null;

      return {
        mesAno,
        hasSnapshot:         !!snap,
        entradas:            pEntradas,
        compromissos:        pCompromissos,
        gastosFixos:         pGastosFixos,
        gastosVariaveis:     pGastosVariaveis,
        gastosSazonais:      pGastosSazonais,
        gastosCartoes:       pGastosCartoes,
        margem:              pMargem,
        margemPercent:       pMargemPercent,
        totalGastos,
        totalSaidas,
        disponivel,
        comprometidoPercent,
        realizado: real ? {
          entradas:        real["ENTRADAS"]         ?? null,
          gastosFixos:     real["GASTOS_FIXOS"]     ?? null,
          gastosVariaveis: real["GASTOS_VARIAVEIS"] ?? null,
          gastosSazonais:  real["GASTOS_SAZONAIS"]  ?? null,
          compromissos:    real["COMPROMISSOS"]     ?? null,
        } : null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return NextResponse.json(ok(series));
}
