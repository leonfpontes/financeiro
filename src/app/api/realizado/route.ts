import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConfigService } from "@/services/config.service";
import { upsertRealizadoSchema } from "@/lib/validations/config.schema";
import { ok, fail } from "@/lib/api-response";

const svc = new ConfigService();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  try {
    const body = await req.json();
    const parsed = upsertRealizadoSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

    const data = await svc.upsertRealizado(userId, parsed.data);
    return NextResponse.json(ok(data));
  } catch {
    return NextResponse.json(fail("VALIDATION", "Payload JSON inválido", 400), { status: 400 });
  }
}
