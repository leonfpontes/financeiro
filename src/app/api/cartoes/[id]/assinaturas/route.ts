import { NextRequest, NextResponse } from "next/server";
import { AssinaturaService } from "@/services/assinatura.service";
import { createAssinaturaSchema } from "@/lib/validations/cartao.schema";
import { ok } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";

export const dynamic = "force-dynamic";
const svc = new AssinaturaService();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const data = await svc.getByCartao(id, auth.userId);
  return NextResponse.json(ok(data.map((a) => ({ ...a, valor: Number(a.valor) }))));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await parseJsonBody(req, createAssinaturaSchema);
  if (body.error) return body.error;

  const data = await svc.create(auth.userId, id, body.data);
  return NextResponse.json(ok({ ...data, valor: Number(data.valor) }), { status: 201 });
}
