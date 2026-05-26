import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AssinaturaService } from "@/services/assinatura.service";
import { updateAssinaturaSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";
import { z } from "zod";

export const dynamic = "force-dynamic";
const svc = new AssinaturaService();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; assinaturaId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id, assinaturaId } = await params;
  const body = await req.json();

  // Special action: cancelar (sets dataFim)
  if (body.action === "cancelar") {
    const schema = z.object({ dataFim: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400), { status: 400 });
    try {
      const existing = await svc.getById(assinaturaId, userId);
      if (existing.cartaoId !== id) {
        return NextResponse.json(fail("NOT_FOUND", "Assinatura não encontrada", 404), { status: 404 });
      }

      const data = await svc.cancelar(assinaturaId, userId, parsed.data.dataFim);
      return NextResponse.json(ok({ ...data, valor: Number(data.valor) }));
    } catch {
      return NextResponse.json(fail("NOT_FOUND", "Assinatura não encontrada", 404), { status: 404 });
    }
  }

  const parsed = updateAssinaturaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

  try {
    const existing = await svc.getById(assinaturaId, userId);
    if (existing.cartaoId !== id) {
      return NextResponse.json(fail("NOT_FOUND", "Assinatura não encontrada", 404), { status: 404 });
    }

    const data = await svc.update(assinaturaId, userId, parsed.data);
    return NextResponse.json(ok({ ...data, valor: Number(data.valor) }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Assinatura não encontrada", 404), { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; assinaturaId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id, assinaturaId } = await params;
  try {
    const existing = await svc.getById(assinaturaId, userId);
    if (existing.cartaoId !== id) {
      return NextResponse.json(fail("NOT_FOUND", "Assinatura não encontrada", 404), { status: 404 });
    }

    await svc.delete(assinaturaId, userId);
    return NextResponse.json(ok({ deleted: true }));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Assinatura não encontrada", 404), { status: 404 });
  }
}
