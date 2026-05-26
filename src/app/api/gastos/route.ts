import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GastoService } from "@/services/gasto.service";
import { createGastoSchema } from "@/lib/validations/gasto.schema";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const svc = new GastoService();

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const data = await svc.getAll(userId);
  return NextResponse.json(ok(data));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  try {
    const body = await req.json();
    const parsed = createGastoSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

    const data = await svc.create(userId, parsed.data);
    return NextResponse.json(ok(data), { status: 201 });
  } catch {
    return NextResponse.json(fail("VALIDATION", "Payload JSON inválido", 400), { status: 400 });
  }
}
