import { NextRequest, NextResponse } from "next/server";
import { ParcelamentoService } from "@/services/parcelamento.service";
import { updateParcelamentoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";
import { currentMesAno } from "@/lib/utils/date";

export const dynamic = "force-dynamic";
const svc = new ParcelamentoService();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; parcelamentoId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id, parcelamentoId } = await params;
  const body = await parseJsonBody(req, updateParcelamentoSchema);
  if (body.error) return body.error;

  try {
    const existing = await svc.getById(parcelamentoId, auth.userId);
    if (existing.cartaoId !== id) {
      return NextResponse.json(fail("NOT_FOUND", "Parcelamento não encontrado", 404), { status: 404 });
    }

    const data = await svc.update(parcelamentoId, auth.userId, body.data);
    return NextResponse.json(ok({ ...data, valorTotal: Number(data.valorTotal), ...ParcelamentoService.calcularInfo(data, currentMesAno()) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Parcelamento não encontrado", 404), { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; parcelamentoId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id, parcelamentoId } = await params;
  try {
    const existing = await svc.getById(parcelamentoId, auth.userId);
    if (existing.cartaoId !== id) {
      return NextResponse.json(fail("NOT_FOUND", "Parcelamento não encontrado", 404), { status: 404 });
    }

    await svc.delete(parcelamentoId, auth.userId);
    return NextResponse.json(ok({ deleted: true }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Parcelamento não encontrado", 404), { status: 404 });
  }
}
