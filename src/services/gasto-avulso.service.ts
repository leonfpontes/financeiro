import { GastoAvulsoCartao } from "@/generated/prisma";
import { GastoAvulsoRepository } from "@/repositories/gasto-avulso.repository";
import { CreateGastoAvulsoInput, UpdateGastoAvulsoInput } from "@/lib/validations/cartao.schema";

export class GastoAvulsoService {
  constructor(private readonly repo = new GastoAvulsoRepository()) {}

  async getByCartaoMes(cartaoId: string, userId: string, mesAno: string): Promise<GastoAvulsoCartao[]> {
    return this.repo.findByCartaoMes(cartaoId, userId, mesAno);
  }

  async getById(id: string, userId: string): Promise<GastoAvulsoCartao> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, cartaoId: string, data: CreateGastoAvulsoInput): Promise<GastoAvulsoCartao> {
    return this.repo.create(userId, cartaoId, data);
  }

  async update(id: string, userId: string, data: UpdateGastoAvulsoInput): Promise<GastoAvulsoCartao> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }
}
