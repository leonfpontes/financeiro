import { NextResponse } from "next/server";
import { CartaoCreditoService } from "@/services/cartao-credito.service";
import { FaturaService } from "@/services/fatura.service";
import { createCartaoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";
import { currentMesAno } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

const svc = new CartaoCreditoService();
const faturaSvc = new FaturaService();

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const cartoes = await svc.getAll(auth.userId);
    const mesAno = currentMesAno();

    const data = await Promise.all(
      cartoes.map(async (c) => {
        const fatura = await faturaSvc.getFaturaDoMes(auth.userId, c.id, mesAno);
        return { ...c, limite: Number(c.limite), faturaMesAtual: fatura.total };
      }),
    );

    return NextResponse.json(ok(data));
  } catch (err) {
    console.error("[GET /api/cartoes]", err);
    return NextResponse.json(fail("INTERNAL", "Erro interno", 500), { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await parseJsonBody(req, createCartaoSchema);
  if (body.error) return body.error;

  const data = await svc.create(auth.userId, body.data);
  return NextResponse.json(ok({ ...data, limite: Number(data.limite) }), { status: 201 });
}
