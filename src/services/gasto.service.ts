import { Gasto } from "@/generated/prisma";
import { GastoRepository } from "@/repositories/gasto.repository";
import { CreateGastoInput, UpdateGastoInput } from "@/lib/validations/gasto.schema";

export class GastoService {
  constructor(private readonly repo = new GastoRepository()) {}

  async getAll(userId: string): Promise<Gasto[]> { return this.repo.findAll(userId); }

  async getById(id: string, userId: string): Promise<Gasto> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, data: CreateGastoInput): Promise<Gasto> { return this.repo.create(userId, data); }

  async update(id: string, userId: string, data: UpdateGastoInput): Promise<Gasto> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }
}
