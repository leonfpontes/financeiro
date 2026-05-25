import { prisma } from "@/lib/prisma";
import { Gasto, Prisma } from "@/generated/prisma";
import { CreateGastoInput, UpdateGastoInput } from "@/lib/validations/gasto.schema";

export class GastoRepository {
  async findAll(userId: string): Promise<Gasto[]> {
    return prisma.gasto.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string, userId: string): Promise<Gasto | null> {
    return prisma.gasto.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateGastoInput): Promise<Gasto> {
    return prisma.gasto.create({
      data: {
        userId,
        nome: data.nome,
        tipo: data.tipo,
        valor: new Prisma.Decimal(data.valor),
        periodoInput: data.periodoInput ?? null,
        mesesOcorrencia: data.mesesOcorrencia ?? [],
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        notas: data.notas ?? null,
        icone: data.icone ?? null,
      },
    });
  }

  async update(id: string, data: UpdateGastoInput): Promise<Gasto> {
    return prisma.gasto.update({
      where: { id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.valor !== undefined && { valor: new Prisma.Decimal(data.valor) }),
        ...(data.periodoInput !== undefined && { periodoInput: data.periodoInput }),
        ...(data.mesesOcorrencia !== undefined && { mesesOcorrencia: data.mesesOcorrencia }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        ...(data.dataInicio !== undefined && { dataInicio: new Date(data.dataInicio) }),
        ...(data.dataFim !== undefined && { dataFim: data.dataFim ? new Date(data.dataFim) : null }),
        ...(data.notas !== undefined && { notas: data.notas }),
        ...(data.icone !== undefined && { icone: data.icone }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.gasto.delete({ where: { id } });
  }
}
