import { prisma } from "@/lib/prisma";
import { Assinatura, Prisma } from "@/generated/prisma";
import { CreateAssinaturaInput, UpdateAssinaturaInput } from "@/lib/validations/cartao.schema";

export class AssinaturaRepository {
  async findByCartao(cartaoId: string, userId: string): Promise<Assinatura[]> {
    return prisma.assinatura.findMany({ where: { cartaoId, userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<Assinatura | null> {
    return prisma.assinatura.findFirst({ where: { id, userId } });
  }

  /** Returns assinaturas ativas em dado mês: dataInicio <= mesAno && (dataFim == null || dataFim >= mesAno) */
  async findActiveInMonth(cartaoId: string, userId: string, mesAno: string): Promise<Assinatura[]> {
    return prisma.assinatura.findMany({
      where: {
        cartaoId,
        userId,
        dataInicio: { lte: mesAno },
        OR: [{ dataFim: null }, { dataFim: { gte: mesAno } }],
      },
    });
  }

  async create(userId: string, cartaoId: string, data: CreateAssinaturaInput): Promise<Assinatura> {
    return prisma.assinatura.create({
      data: {
        userId,
        cartaoId,
        nome: data.nome,
        valor: new Prisma.Decimal(data.valor),
        dataInicio: data.dataInicio,
        dataFim: data.dataFim ?? null,
        icone: data.icone ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async update(id: string, data: UpdateAssinaturaInput): Promise<Assinatura> {
    return prisma.assinatura.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.valor !== undefined && { valor: new Prisma.Decimal(data.valor) }),
        ...(data.dataInicio !== undefined && { dataInicio: data.dataInicio }),
        ...(data.dataFim !== undefined && { dataFim: data.dataFim }),
        ...(data.icone !== undefined && { icone: data.icone }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.assinatura.delete({ where: { id } });
  }
}
