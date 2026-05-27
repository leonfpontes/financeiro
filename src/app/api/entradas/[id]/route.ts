import { NextResponse } from "next/server";
import { EntradaService } from "@/services/entrada.service";
import { updateEntradaSchema } from "@/lib/validations/entrada.schema";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";

const svc = new EntradaService();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await parseJsonBody(req, updateEntradaSchema);
  if (body.error) return body.error;

  try {
    const data = await svc.update(id, auth.userId, body.data);
    return NextResponse.json(ok(data));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Entrada não encontrada", 404), { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    await svc.delete(id, auth.userId);
    return NextResponse.json(ok(null));
  } catch {
    return NextResponse.json(fail("NOT_FOUND", "Entrada não encontrada", 404), { status: 404 });
  }
}
