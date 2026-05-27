import { Gasto } from "@/generated/prisma";
import { GastoRepository } from "@/repositories/gasto.repository";
import { CreateGastoInput, UpdateGastoInput } from "@/lib/validations/gasto.schema";
import { BaseCrudService } from "@/services/base.service";

export class GastoService extends BaseCrudService<Gasto, CreateGastoInput, UpdateGastoInput> {
  constructor(repo: GastoRepository = new GastoRepository()) {
    super(repo);
  }
}
