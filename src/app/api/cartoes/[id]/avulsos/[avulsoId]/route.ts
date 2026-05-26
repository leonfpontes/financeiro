import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GastoAvulsoService } from "@/services/gasto-avulso.service";
import { updateGastoAvulsoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";
const svc = new GastoAvulsoService();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; avulsoId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id, avulsoId } = await params;
  const body = await req.json();
  const parsed = updateGastoAvulsoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

  try {
    const existing = await svc.getById(avulsoId, userId);
    if (existing.cartaoId !== id) {
      return NextResponse.json(fail("NOT_FOUND", "Lançamento não encontrado", 404), { status: 404 });
    }

    const data = await svc.update(avulsoId, userId, parsed.data);
    return NextResponse.json(ok({ ...data, valor: Number(data.valor) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Lançamento não encontrado", 404), { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; avulsoId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id, avulsoId } = await params;
  try {
    const existing = await svc.getById(avulsoId, userId);
    if (existing.cartaoId !== id) {
      return NextResponse.json(fail("NOT_FOUND", "Lançamento não encontrado", 404), { status: 404 });
    }

    await svc.delete(avulsoId, userId);
    return NextResponse.json(ok({ deleted: true }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Lançamento não encontrado", 404), { status: 404 });
  }
}
