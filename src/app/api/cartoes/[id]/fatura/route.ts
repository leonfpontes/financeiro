import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FaturaService } from "@/services/fatura.service";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";
const svc = new FaturaService();
const mesAnoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

function currentMesAno(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  const mesAno = req.nextUrl.searchParams.get("mesAno") ?? currentMesAno();
  if (!mesAnoRegex.test(mesAno)) {
    return NextResponse.json(fail("VALIDATION", "mesAno inválido", 400), { status: 400 });
  }

  try {
    const [fatura, historico] = await Promise.all([
      svc.getFaturaDoMes(userId, id, mesAno),
      svc.getHistoricoFatura(userId, id, 6),
    ]);

    const regressao = svc.calcularRegressao(historico, 3);

    return NextResponse.json(ok({
      mesAno,
      fatura: {
        ...fatura,
        assinaturas: fatura.assinaturas.map((a) => ({ ...a, valor: Number(a.valor) })),
        parcelamentos: fatura.parcelamentos.map((p) => ({ ...p, valorTotal: Number(p.valorTotal) })),
        avulsos: fatura.avulsos.map((a) => ({ ...a, valor: Number(a.valor) })),
      },
      historico,
      regressao,
    }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}
