import { ConfigUsuario, RealizadoMensal } from "@/generated/prisma";
import { ConfigRepository } from "@/repositories/config.repository";
import { UpdateConfigInput, UpsertRealizadoInput } from "@/lib/validations/config.schema";

export class ConfigService {
  constructor(private readonly repo = new ConfigRepository()) {}

  async getConfig(userId: string): Promise<ConfigUsuario> { return this.repo.getOrCreate(userId); }

  async updateConfig(userId: string, data: UpdateConfigInput): Promise<ConfigUsuario> { return this.repo.update(userId, data); }

  async upsertRealizado(userId: string, data: UpsertRealizadoInput): Promise<RealizadoMensal> { return this.repo.upsertRealizado(userId, data); }

  async getRealizadoByMes(userId: string, mesAno: string): Promise<RealizadoMensal[]> { return this.repo.getRealizadoByMes(userId, mesAno); }
}
