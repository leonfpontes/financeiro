import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// DELETE /api/evolucao/snapshots
// Body: { mesAnos?: string[] }  — se omitido, apaga TODOS os snapshots do usuário
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return fail("UNAUTHORIZED", "Não autenticado", 401);

  let mesAnos: string[] | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    mesAnos = Array.isArray(body.mesAnos) ? body.mesAnos : undefined;
  } catch {
    mesAnos = undefined;
  }

  const where = mesAnos?.length
    ? { userId, mesAno: { in: mesAnos } }
    : { userId };

  const { count } = await prisma.snapshotMensal.deleteMany({ where });

  return ok({ deleted: count });
}
