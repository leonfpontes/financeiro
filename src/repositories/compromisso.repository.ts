import { prisma } from "@/lib/prisma";
import { Compromisso, Prisma } from "@/generated/prisma";
import { CreateCompromissoInput, UpdateCompromissoInput } from "@/lib/validations/compromisso.schema";

export class CompromissoRepository {
  async findAll(userId: string): Promise<Compromisso[]> {
    return prisma.compromisso.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<Compromisso | null> {
    return prisma.compromisso.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateCompromissoInput): Promise<Compromisso> {
    return prisma.compromisso.create({
      data: { userId, nome: data.nome, tipo: data.tipo, valorMensal: new Prisma.Decimal(data.valorMensal), notas: data.notas ?? null },
    });
  }

  async update(id: string, data: UpdateCompromissoInput): Promise<Compromisso> {
    return prisma.compromisso.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.valorMensal !== undefined && { valorMensal: new Prisma.Decimal(data.valorMensal) }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.compromisso.delete({ where: { id } });
  }
}
