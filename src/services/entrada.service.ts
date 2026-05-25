import { Entrada } from "@/generated/prisma";
import { EntradaRepository } from "@/repositories/entrada.repository";
import { CreateEntradaInput, UpdateEntradaInput } from "@/lib/validations/entrada.schema";

export class EntradaService {
  constructor(private readonly repo = new EntradaRepository()) {}

  async getAll(userId: string): Promise<Entrada[]> { return this.repo.findAll(userId); }

  async getById(id: string, userId: string): Promise<Entrada> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, data: CreateEntradaInput): Promise<Entrada> { return this.repo.create(userId, data); }

  async update(id: string, userId: string, data: UpdateEntradaInput): Promise<Entrada> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }
}
