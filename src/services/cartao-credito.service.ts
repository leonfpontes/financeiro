import { CartaoCredito } from "@/generated/prisma";
import { CartaoCreditoRepository } from "@/repositories/cartao-credito.repository";
import { CreateCartaoInput, UpdateCartaoInput } from "@/lib/validations/cartao.schema";

export class CartaoCreditoService {
  constructor(private readonly repo = new CartaoCreditoRepository()) {}

  async getAll(userId: string): Promise<CartaoCredito[]> { return this.repo.findAll(userId); }

  async getById(id: string, userId: string): Promise<CartaoCredito> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, data: CreateCartaoInput): Promise<CartaoCredito> { return this.repo.create(userId, data); }

  async update(id: string, userId: string, data: UpdateCartaoInput): Promise<CartaoCredito> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }

  async countDependents(id: string, userId: string) {
    await this.getById(id, userId);
    return this.repo.countDependents(id);
  }
}
