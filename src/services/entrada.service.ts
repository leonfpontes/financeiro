import { Entrada } from "@/generated/prisma";
import { EntradaRepository } from "@/repositories/entrada.repository";
import { CreateEntradaInput, UpdateEntradaInput } from "@/lib/validations/entrada.schema";
import { BaseCrudService } from "@/services/base.service";

export class EntradaService extends BaseCrudService<Entrada, CreateEntradaInput, UpdateEntradaInput> {
  constructor(repo: EntradaRepository = new EntradaRepository()) {
    super(repo);
  }
}
