import { prisma } from "@/lib/prisma";
import { Parcelamento, Prisma } from "@/generated/prisma";
import { CreateParcelamentoInput, UpdateParcelamentoInput } from "@/lib/validations/cartao.schema";
import { addMonths } from "@/lib/utils/date";

export class ParcelamentoRepository {
  async findByCartao(cartaoId: string, userId: string): Promise<Parcelamento[]> {
    return prisma.parcelamento.findMany({ where: { cartaoId, userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<Parcelamento | null> {
    return prisma.parcelamento.findFirst({ where: { id, userId } });
  }

  /** Returns parcelamentos ativos em dado mês: mesInicio <= mesAno <= mesInicio + (numeroParcelas - 1) months */
  async findActiveInMonth(cartaoId: string, userId: string, mesAno: string): Promise<Parcelamento[]> {
    const all = await prisma.parcelamento.findMany({
      where: { cartaoId, userId, mesInicio: { lte: mesAno } },
    });
    return all.filter((p) => {
      const mesFim = addMonths(p.mesInicio, p.numeroParcelas - 1);
      return mesFim >= mesAno;
    });
  }

  async create(userId: string, cartaoId: string, data: CreateParcelamentoInput): Promise<Parcelamento> {
    return prisma.parcelamento.create({
      data: {
        userId,
        cartaoId,
        nome: data.nome,
        valorTotal: new Prisma.Decimal(data.valorTotal),
        numeroParcelas: data.numeroParcelas,
        mesInicio: data.mesInicio,
        icone: data.icone ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async update(id: string, data: UpdateParcelamentoInput): Promise<Parcelamento> {
    return prisma.parcelamento.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.valorTotal !== undefined && { valorTotal: new Prisma.Decimal(data.valorTotal) }),
        ...(data.numeroParcelas !== undefined && { numeroParcelas: data.numeroParcelas }),
        ...(data.mesInicio !== undefined && { mesInicio: data.mesInicio }),
        ...(data.icone !== undefined && { icone: data.icone }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.parcelamento.delete({ where: { id } });
  }
}
