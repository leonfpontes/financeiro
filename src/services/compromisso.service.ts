import { Compromisso } from "@/generated/prisma";
import { CompromissoRepository } from "@/repositories/compromisso.repository";
import { CreateCompromissoInput, UpdateCompromissoInput } from "@/lib/validations/compromisso.schema";
import { BaseCrudService } from "@/services/base.service";

export class CompromissoService extends BaseCrudService<Compromisso, CreateCompromissoInput, UpdateCompromissoInput> {
  constructor(repo: CompromissoRepository = new CompromissoRepository()) {
    super(repo);
  }
}
