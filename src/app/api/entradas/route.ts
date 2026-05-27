import { NextResponse } from "next/server";
import { EntradaService } from "@/services/entrada.service";
import { createEntradaSchema } from "@/lib/validations/entrada.schema";
import { ok } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";

export const dynamic = "force-dynamic";

const svc = new EntradaService();

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const data = await svc.getAll(auth.userId);
  return NextResponse.json(ok(data));
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await parseJsonBody(req, createEntradaSchema);
  if (body.error) return body.error;

  const data = await svc.create(auth.userId, body.data);
  return NextResponse.json(ok(data), { status: 201 });
}
