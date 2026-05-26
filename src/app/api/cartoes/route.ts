import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartaoCreditoService } from "@/services/cartao-credito.service";
import { FaturaService } from "@/services/fatura.service";
import { createCartaoSchema } from "@/lib/validations/cartao.schema";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const svc = new CartaoCreditoService();
const faturaSvc = new FaturaService();

function currentMesAno(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  try {
    const cartoes = await svc.getAll(userId);
    const mesAno = currentMesAno();

    const data = await Promise.all(
      cartoes.map(async (c) => {
        const fatura = await faturaSvc.getFaturaDoMes(userId, c.id, mesAno);
        return { ...c, limite: Number(c.limite), faturaMesAtual: fatura.total };
      }),
    );

    return NextResponse.json(ok(data));
  } catch (err) {
    console.error("[GET /api/cartoes]", err);
    const msg = "Erro interno";
    return NextResponse.json(fail("INTERNAL", msg, 500), { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail("VALIDATION", "Payload JSON inválido", 400), { status: 400 });
  }
  const parsed = createCartaoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });

  const data = await svc.create(userId, parsed.data);
  return NextResponse.json(ok({ ...data, limite: Number(data.limite) }), { status: 201 });
}
