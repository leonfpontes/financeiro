import { Compromisso } from "@/generated/prisma";
import { CompromissoRepository } from "@/repositories/compromisso.repository";
import { CreateCompromissoInput, UpdateCompromissoInput } from "@/lib/validations/compromisso.schema";

export class CompromissoService {
  constructor(private readonly repo = new CompromissoRepository()) {}

  async getAll(userId: string): Promise<Compromisso[]> { return this.repo.findAll(userId); }

  async getById(id: string, userId: string): Promise<Compromisso> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, data: CreateCompromissoInput): Promise<Compromisso> { return this.repo.create(userId, data); }

  async update(id: string, userId: string, data: UpdateCompromissoInput): Promise<Compromisso> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }
}
