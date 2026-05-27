import { prisma } from "@/lib/prisma";
import { Compromisso, Prisma } from "@/generated/prisma";
import { CreateCompromissoInput, UpdateCompromissoInput } from "@/lib/validations/compromisso.schema";
import { calcSonhoMensal } from "@/lib/utils/sonho";

export class CompromissoRepository {
  async findAll(userId: string): Promise<Compromisso[]> {
    return prisma.compromisso.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<Compromisso | null> {
    return prisma.compromisso.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateCompromissoInput): Promise<Compromisso> {
    const hoje = new Date();
    let valorMensal: Prisma.Decimal;

    if (data.tipo === "SONHO" && data.metaTotal && data.dataAlvo) {
      valorMensal = new Prisma.Decimal(calcSonhoMensal(data.metaTotal, data.dataAlvo, hoje));
    } else {
      valorMensal = new Prisma.Decimal(data.valorMensal ?? 0);
    }

    return prisma.compromisso.create({
      data: {
        userId,
        nome: data.nome,
        tipo: data.tipo,
        valorMensal,
        metaTotal: data.metaTotal ? new Prisma.Decimal(data.metaTotal) : null,
        dataAlvo: data.dataAlvo ? new Date(data.dataAlvo + "-01") : null,
        notas: data.notas ?? null,
      },
    });
  }

  async update(id: string, data: UpdateCompromissoInput): Promise<Compromisso> {
    // Recalcula valorMensal para SONHO se metaTotal ou dataAlvo foram atualizados
    let valorMensalUpdate: Prisma.Decimal | undefined;
    if (data.metaTotal !== undefined || data.dataAlvo !== undefined) {
      // Busca o registro atual para complementar os campos ausentes
      const atual = await prisma.compromisso.findUnique({ where: { id } });
      if (atual?.tipo === "SONHO") {
        const meta = data.metaTotal ?? (atual.metaTotal ? Number(atual.metaTotal) : null);
        const alvoStr = data.dataAlvo !== undefined
          ? data.dataAlvo
          : atual.dataAlvo
            ? `${atual.dataAlvo.getUTCFullYear()}-${String(atual.dataAlvo.getUTCMonth() + 1).padStart(2, "0")}`
            : null;
        if (meta && alvoStr) {
          valorMensalUpdate = new Prisma.Decimal(calcSonhoMensal(meta, alvoStr, new Date()));
        }
      }
    }
    if (data.valorMensal !== undefined && !valorMensalUpdate) {
      valorMensalUpdate = new Prisma.Decimal(data.valorMensal);
    }

    return prisma.compromisso.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(valorMensalUpdate !== undefined && { valorMensal: valorMensalUpdate }),
        ...(data.metaTotal !== undefined && { metaTotal: data.metaTotal ? new Prisma.Decimal(data.metaTotal) : null }),
        ...(data.dataAlvo !== undefined && { dataAlvo: data.dataAlvo ? new Date(data.dataAlvo + "-01") : null }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.compromisso.delete({ where: { id } });
  }
}
