import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartaoCreditoService } from "@/services/cartao-credito.service";
import { updateCartaoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";
const svc = new CartaoCreditoService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  try {
    const cartao = await svc.getById(id, userId);
    return NextResponse.json(ok({ ...cartao, limite: Number(cartao.limite) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateCartaoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

  try {
    const data = await svc.update(id, userId, parsed.data);
    return NextResponse.json(ok({ ...data, limite: Number(data.limite) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  try {
    const dependents = await svc.countDependents(id, userId);
    await svc.delete(id, userId);
    return NextResponse.json(ok({ deleted: true, dependents }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });
  }
}
