import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth.schema";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Dados inválidos", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("CONFLICT", "Email já cadastrado", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });

    return NextResponse.json(ok({ id: user.id, name: user.name, email: user.email }), { status: 201 });
  } catch {
    return fail("INTERNAL_ERROR", "Erro interno", 500);
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return fail("UNAUTHORIZED", "Não autenticado", 401);
  const user = session.user as { id: string; name?: string | null; email?: string | null };
  return ok({ id: user.id, name: user.name, email: user.email });
}
