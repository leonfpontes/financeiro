import { prisma } from "@/lib/prisma";
import { Entrada, Prisma } from "@/generated/prisma";
import { CreateEntradaInput, UpdateEntradaInput } from "@/lib/validations/entrada.schema";

export class EntradaRepository {
  async findAll(userId: string): Promise<Entrada[]> {
    return prisma.entrada.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<Entrada | null> {
    return prisma.entrada.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateEntradaInput): Promise<Entrada> {
    return prisma.entrada.create({
      data: { userId, nome: data.nome, tipo: data.tipo, valor: new Prisma.Decimal(data.valor), notas: data.notas ?? null },
    });
  }

  async update(id: string, data: UpdateEntradaInput): Promise<Entrada> {
    return prisma.entrada.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.valor !== undefined && { valor: new Prisma.Decimal(data.valor) }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.entrada.delete({ where: { id } });
  }
}
