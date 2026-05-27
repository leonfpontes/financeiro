import { NextResponse } from "next/server";
import { ConfigService } from "@/services/config.service";
import { updateConfigSchema } from "@/lib/validations/config.schema";
import { ok } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";

export const dynamic = "force-dynamic";

const svc = new ConfigService();

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const data = await svc.getConfig(auth.userId);
  return NextResponse.json(ok(data));
}

export async function PATCH(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await parseJsonBody(req, updateConfigSchema);
  if (body.error) return body.error;

  const data = await svc.updateConfig(auth.userId, body.data);
  return NextResponse.json(ok(data));
}
