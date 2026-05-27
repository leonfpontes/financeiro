/**
 * Endpoint de configuração única de senha (one-time setup).
 *
 * SÓ funciona se a variável de ambiente SETUP_TOKEN estiver definida.
 * Remova SETUP_TOKEN do ambiente após usar para desativar o endpoint.
 *
 * Uso:
 *   POST /api/auth/setup
 *   Body: { "token": "<SETUP_TOKEN>", "email": "user@example.com", "password": "NovaSenha123" }
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const setupToken = process.env.SETUP_TOKEN;
  if (!setupToken) {
    // Endpoint completamente desativado se não houver token configurado
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { token?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || body.token !== setupToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!body.email || !body.password || body.password.length < 8) {
    return NextResponse.json({ error: "email e password (min 8 chars) obrigatórios" }, { status: 400 });
  }

  const email = body.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const hash = await bcrypt.hash(body.password, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash: hash },
  });

  // Verificação imediata: confere que o hash recém-criado bate com a senha
  const verify = await bcrypt.compare(body.password, hash);
  return NextResponse.json({ ok: true, hashVerified: verify, hashLength: hash.length });
}
