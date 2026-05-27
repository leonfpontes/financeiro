import { NextRequest, NextResponse } from "next/server";
import { ParcelamentoService } from "@/services/parcelamento.service";
import { createParcelamentoSchema } from "@/lib/validations/cartao.schema";
import { ok } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";
import { currentMesAno } from "@/lib/utils/date";

export const dynamic = "force-dynamic";
const svc = new ParcelamentoService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const mesAno = currentMesAno();
  const data = await svc.getByCartao(id, auth.userId);
  return NextResponse.json(ok(data.map((p) => ({
    ...p,
    valorTotal: Number(p.valorTotal),
    ...ParcelamentoService.calcularInfo(p, mesAno),
  }))));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await parseJsonBody(req, createParcelamentoSchema);
  if (body.error) return body.error;

  const data = await svc.create(auth.userId, id, body.data);
  return NextResponse.json(ok({ ...data, valorTotal: Number(data.valorTotal), ...ParcelamentoService.calcularInfo(data, currentMesAno()) }), { status: 201 });
}
