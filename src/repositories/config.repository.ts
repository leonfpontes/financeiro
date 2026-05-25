import { prisma } from "@/lib/prisma";
import { ConfigUsuario, RealizadoMensal, Prisma } from "@/generated/prisma";
import { UpdateConfigInput, UpsertRealizadoInput } from "@/lib/validations/config.schema";

export class ConfigRepository {
  async getOrCreate(userId: string): Promise<ConfigUsuario> {
    const existing = await prisma.configUsuario.findUnique({ where: { userId } });
    if (existing) return existing;
    return prisma.configUsuario.create({ data: { userId } });
  }

  async update(userId: string, data: UpdateConfigInput): Promise<ConfigUsuario> {
    return prisma.configUsuario.upsert({
      where: { userId },
      create: {
        userId,
        ...(data.margemPercent !== undefined && { margemPercent: new Prisma.Decimal(data.margemPercent) }),
        ...(data.tetoCreditCard !== undefined && { tetoCreditCard: data.tetoCreditCard !== null ? new Prisma.Decimal(data.tetoCreditCard) : null }),
        ...(data.notasPlanoAcao !== undefined && { notasPlanoAcao: data.notasPlanoAcao }),
      },
      update: {
        ...(data.margemPercent !== undefined && { margemPercent: new Prisma.Decimal(data.margemPercent) }),
        ...(data.tetoCreditCard !== undefined && { tetoCreditCard: data.tetoCreditCard !== null ? new Prisma.Decimal(data.tetoCreditCard) : null }),
        ...(data.notasPlanoAcao !== undefined && { notasPlanoAcao: data.notasPlanoAcao }),
      },
    });
  }

  async upsertRealizado(userId: string, data: UpsertRealizadoInput): Promise<RealizadoMensal> {
    return prisma.realizadoMensal.upsert({
      where: { userId_mesAno_grupo: { userId, mesAno: data.mesAno, grupo: data.grupo } },
      create: { userId, mesAno: data.mesAno, grupo: data.grupo, valorRealizado: new Prisma.Decimal(data.valorRealizado) },
      update: { valorRealizado: new Prisma.Decimal(data.valorRealizado) },
    });
  }

  async getRealizadoByMes(userId: string, mesAno: string): Promise<RealizadoMensal[]> {
    return prisma.realizadoMensal.findMany({ where: { userId, mesAno } });
  }
}
