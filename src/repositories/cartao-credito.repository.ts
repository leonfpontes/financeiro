import { prisma } from "@/lib/prisma";
import { CartaoCredito, Prisma } from "@/generated/prisma";
import { CreateCartaoInput, UpdateCartaoInput } from "@/lib/validations/cartao.schema";

export class CartaoCreditoRepository {
  async findAll(userId: string): Promise<CartaoCredito[]> {
    return prisma.cartaoCredito.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<CartaoCredito | null> {
    return prisma.cartaoCredito.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateCartaoInput): Promise<CartaoCredito> {
    return prisma.cartaoCredito.create({
      data: {
        userId,
        nome: data.nome,
        limite: new Prisma.Decimal(data.limite),
        diaVencimento: data.diaVencimento,
        cor: data.cor ?? null,
        ativo: data.ativo ?? true,
      },
    });
  }

  async update(id: string, data: UpdateCartaoInput): Promise<CartaoCredito> {
    return prisma.cartaoCredito.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.limite !== undefined && { limite: new Prisma.Decimal(data.limite) }),
        ...(data.diaVencimento !== undefined && { diaVencimento: data.diaVencimento }),
        ...(data.cor !== undefined && { cor: data.cor }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.cartaoCredito.delete({ where: { id } });
  }

  async countDependents(id: string): Promise<{ assinaturas: number; parcelamentos: number; avulsos: number }> {
    const [assinaturas, parcelamentos, avulsos] = await Promise.all([
      prisma.assinatura.count({ where: { cartaoId: id } }),
      prisma.parcelamento.count({ where: { cartaoId: id } }),
      prisma.gastoAvulsoCartao.count({ where: { cartaoId: id } }),
    ]);
    return { assinaturas, parcelamentos, avulsos };
  }
}
