import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { z } from "zod";

export const dynamic = "force-dynamic";
const mesAnoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

const deleteSnapshotsSchema = z
  .object({
    mesAnos: z.array(z.string().regex(mesAnoRegex, "mesAno inválido")).min(1).max(24).optional(),
    deleteAll: z.boolean().optional(),
  })
  .refine((data) => (data.deleteAll === true) !== !!data.mesAnos, {
    message: "Informe deleteAll=true ou mesAnos, mas não ambos",
  });

// DELETE /api/evolucao/snapshots
// Body: { deleteAll: true } ou { mesAnos: string[] }
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json(fail("UNAUTHORIZED", "Não autenticado", 401), { status: 401 });

  try {
    const body = await req.json();
    const parsed = deleteSnapshotsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 },
      );
    }

    const where = parsed.data.deleteAll
      ? { userId }
      : { userId, mesAno: { in: parsed.data.mesAnos! } };

    const { count } = await prisma.snapshotMensal.deleteMany({ where });
    return NextResponse.json(ok({ deleted: count }));
  } catch {
    return NextResponse.json(fail("VALIDATION", "Payload JSON inválido", 400), { status: 400 });
  }
}
