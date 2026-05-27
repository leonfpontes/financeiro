/**
 * Health-check da conexão com o banco de dados.
 * Retorna 200 se a conexão estiver OK, 503 caso contrário.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ db: "ok" });
  } catch (err) {
    console.error("[Health] DB connection failed:", err);
    return NextResponse.json(
      { db: "error", message: err instanceof Error ? err.message : String(err) },
      { status: 503 }
    );
  }
}
