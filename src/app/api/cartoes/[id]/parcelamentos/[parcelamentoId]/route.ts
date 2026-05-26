import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ParcelamentoService } from "@/services/parcelamento.service";
import { updateParcelamentoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";
const svc = new ParcelamentoService();

function currentMesAno(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; parcelamentoId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { parcelamentoId } = await params;
  const body = await req.json();
  const parsed = updateParcelamentoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

  try {
    const data = await svc.update(parcelamentoId, userId, parsed.data);
    return NextResponse.json(ok({ ...data, valorTotal: Number(data.valorTotal), ...ParcelamentoService.calcularInfo(data, currentMesAno()) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Parcelamento não encontrado", 404), { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; parcelamentoId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { parcelamentoId } = await params;
  try {
    await svc.delete(parcelamentoId, userId);
    return NextResponse.json(ok({ deleted: true }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Parcelamento não encontrado", 404), { status: 404 });
  }
}
