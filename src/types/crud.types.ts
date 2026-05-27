export interface ICrudRepository<T, CreateInput, UpdateInput> {
  findAll(userId: string): Promise<T[]>;
  findById(id: string, userId: string): Promise<T | null>;
  create(userId: string, data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface ICrudService<T, CreateInput, UpdateInput> {
  getAll(userId: string): Promise<T[]>;
  getById(id: string, userId: string): Promise<T>;
  create(userId: string, data: CreateInput): Promise<T>;
  update(id: string, userId: string, data: UpdateInput): Promise<T>;
  delete(id: string, userId: string): Promise<void>;
}
