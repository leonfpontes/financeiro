import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth.schema";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate-limit por IP — máx. 5 registros / 15 min
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const { allowed } = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(fail("RATE_LIMIT", "Muitas tentativas. Tente novamente em 15 minutos.", 429), { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(fail("VALIDATION_ERROR", "Payload JSON inválido", 400), { status: 400 });
    }
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("VALIDATION_ERROR", "Dados inválidos", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 422 });
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json(fail("CONFLICT", "Email já cadastrado", 409), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });

    return NextResponse.json(ok({ id: user.id, name: user.name, email: user.email }), { status: 201 });
  } catch {
    return NextResponse.json(fail("INTERNAL_ERROR", "Erro interno", 500), { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(fail("UNAUTHORIZED", "Não autenticado", 401), { status: 401 });
  const user = session.user as { id: string; name?: string | null; email?: string | null };
  return NextResponse.json(ok({ id: user.id, name: user.name, email: user.email }));
}
