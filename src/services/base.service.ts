import { ICrudRepository } from "@/types/crud.types";

/**
 * Generic base service that covers the standard CRUD lifecycle.
 * Concrete services extend this class and only add domain-specific methods.
 *
 * DIP: depends on ICrudRepository abstraction, not a concrete implementation.
 * Injection happens via the constructor with a default value for convenience.
 */
export abstract class BaseCrudService<T, CreateInput, UpdateInput> {
  constructor(protected readonly repo: ICrudRepository<T, CreateInput, UpdateInput>) {}

  async getAll(userId: string): Promise<T[]> {
    return this.repo.findAll(userId);
  }

  async getById(id: string, userId: string): Promise<T> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, data: CreateInput): Promise<T> {
    return this.repo.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateInput): Promise<T> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }
}
