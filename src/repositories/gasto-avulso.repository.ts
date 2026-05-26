import { prisma } from "@/lib/prisma";
import { GastoAvulsoCartao, Prisma } from "@/generated/prisma";
import { CreateGastoAvulsoInput, UpdateGastoAvulsoInput } from "@/lib/validations/cartao.schema";

export class GastoAvulsoRepository {
  async findByCartaoMes(cartaoId: string, userId: string, mesAno: string): Promise<GastoAvulsoCartao[]> {
    return prisma.gastoAvulsoCartao.findMany({
      where: { cartaoId, userId, mesAno },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string, userId: string): Promise<GastoAvulsoCartao | null> {
    return prisma.gastoAvulsoCartao.findFirst({ where: { id, userId } });
  }

  async create(userId: string, cartaoId: string, data: CreateGastoAvulsoInput): Promise<GastoAvulsoCartao> {
    return prisma.gastoAvulsoCartao.create({
      data: {
        userId,
        cartaoId,
        nome: data.nome,
        valor: new Prisma.Decimal(data.valor),
        mesAno: data.mesAno,
        icone: data.icone ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async update(id: string, data: UpdateGastoAvulsoInput): Promise<GastoAvulsoCartao> {
    return prisma.gastoAvulsoCartao.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.valor !== undefined && { valor: new Prisma.Decimal(data.valor) }),
        ...(data.mesAno !== undefined && { mesAno: data.mesAno }),
        ...(data.icone !== undefined && { icone: data.icone }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.gastoAvulsoCartao.delete({ where: { id } });
  }
}
