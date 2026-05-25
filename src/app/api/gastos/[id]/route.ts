import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GastoService } from "@/services/gasto.service";
import { updateGastoSchema } from "@/lib/validations/gasto.schema";
import { ok, fail } from "@/lib/api-response";

const svc = new GastoService();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateGastoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten()), { status: 400 });

  try {
    const data = await svc.update(id, userId, parsed.data);
    return NextResponse.json(ok(data));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Gasto não encontrado", 404), { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  try {
    await svc.delete(id, userId);
    return NextResponse.json(ok(null));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Gasto não encontrado", 404), { status: 404 });
  }
}
