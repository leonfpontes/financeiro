import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id: cartaoId } = await params;
  const mesAno = req.nextUrl.searchParams.get("mesAno");
  if (!mesAno || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mesAno))
    return NextResponse.json(fail("VALIDATION", "mesAno inválido", 400), { status: 400 });

  const cartao = await prisma.cartaoCredito.findFirst({ where: { id: cartaoId, userId } });
  if (!cartao) return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });

  const pagamento = await prisma.faturaPagamento.findUnique({
    where: { cartaoId_mesAno: { cartaoId, mesAno } },
  });

  return NextResponse.json(ok({
    pago: pagamento?.pago ?? false,
    dataPagamento: pagamento?.dataPagamento?.toISOString().slice(0, 10) ?? null,
  }));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 });

  const { id: cartaoId } = await params;

  let body: { mesAno: string; pago: boolean; dataPagamento: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail("VALIDATION", "Payload JSON inválido", 400), { status: 400 });
  }

  const { mesAno, pago, dataPagamento } = body;
  if (!mesAno || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mesAno) || typeof pago !== "boolean")
    return NextResponse.json(fail("VALIDATION", "Dados inválidos", 400), { status: 400 });

  const cartao = await prisma.cartaoCredito.findFirst({ where: { id: cartaoId, userId } });
  if (!cartao) return NextResponse.json(fail("NOT_FOUND", "Cartão não encontrado", 404), { status: 404 });

  const record = await prisma.faturaPagamento.upsert({
    where: { cartaoId_mesAno: { cartaoId, mesAno } },
    create: {
      cartaoId,
      userId,
      mesAno,
      pago,
      dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
    },
    update: {
      pago,
      dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
    },
  });

  return NextResponse.json(ok({
    pago: record.pago,
    dataPagamento: record.dataPagamento?.toISOString().slice(0, 10) ?? null,
  }));
}
