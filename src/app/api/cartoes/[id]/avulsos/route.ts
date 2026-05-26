import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GastoAvulsoService } from "@/services/gasto-avulso.service";
import { createGastoAvulsoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";
const svc = new GastoAvulsoService();

function currentMesAno(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  const mesAno = req.nextUrl.searchParams.get("mesAno") ?? currentMesAno();
  const data = await svc.getByCartaoMes(id, userId, mesAno);
  return NextResponse.json(ok(data.map((a) => ({ ...a, valor: Number(a.valor) }))));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = createGastoAvulsoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

  const data = await svc.create(userId, id, parsed.data);
  return NextResponse.json(ok({ ...data, valor: Number(data.valor) }), { status: 201 });
}
