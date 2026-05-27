import { NextResponse } from "next/server";
import { ConfigService } from "@/services/config.service";
import { upsertRealizadoSchema } from "@/lib/validations/config.schema";
import { ok } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";

const svc = new ConfigService();

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await parseJsonBody(req, upsertRealizadoSchema);
  if (body.error) return body.error;

  const data = await svc.upsertRealizado(auth.userId, body.data);
  return NextResponse.json(ok(data));
}
