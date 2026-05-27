import { NextRequest, NextResponse } from "next/server";
import { CartaoCreditoService } from "@/services/cartao-credito.service";
import { updateCartaoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";

export const dynamic = "force-dynamic";
const svc = new CartaoCreditoService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    const cartao = await svc.getById(id, auth.userId);
    return NextResponse.json(ok({ ...cartao, limite: Number(cartao.limite) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await parseJsonBody(req, updateCartaoSchema);
  if (body.error) return body.error;

  try {
    const data = await svc.update(id, auth.userId, body.data);
    return NextResponse.json(ok({ ...data, limite: Number(data.limite) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    const dependents = await svc.countDependents(id, auth.userId);
    await svc.delete(id, auth.userId);
    return NextResponse.json(ok({ deleted: true, dependents }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}
