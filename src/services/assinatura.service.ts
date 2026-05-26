import { Assinatura } from "@/generated/prisma";
import { AssinaturaRepository } from "@/repositories/assinatura.repository";
import { CreateAssinaturaInput, UpdateAssinaturaInput } from "@/lib/validations/cartao.schema";

export class AssinaturaService {
  constructor(private readonly repo = new AssinaturaRepository()) {}

  async getByCartao(cartaoId: string, userId: string): Promise<Assinatura[]> {
    return this.repo.findByCartao(cartaoId, userId);
  }

  async getById(id: string, userId: string): Promise<Assinatura> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, cartaoId: string, data: CreateAssinaturaInput): Promise<Assinatura> {
    return this.repo.create(userId, cartaoId, data);
  }

  async update(id: string, userId: string, data: UpdateAssinaturaInput): Promise<Assinatura> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async cancelar(id: string, userId: string, dataFim: string): Promise<Assinatura> {
    await this.getById(id, userId);
    return this.repo.update(id, { dataFim });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }
}
