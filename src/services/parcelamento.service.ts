import { Parcelamento } from "@/generated/prisma";
import { ParcelamentoRepository } from "@/repositories/parcelamento.repository";
import { CartaoCreditoRepository } from "@/repositories/cartao-credito.repository";
import { CreateParcelamentoInput, UpdateParcelamentoInput } from "@/lib/validations/cartao.schema";
import { addMonths } from "@/lib/utils/date";

export class ParcelamentoService {
  constructor(
    private readonly repo: ParcelamentoRepository = new ParcelamentoRepository(),
    private readonly cartaoRepo: CartaoCreditoRepository = new CartaoCreditoRepository(),
  ) {}

  async getByCartao(cartaoId: string, userId: string): Promise<Parcelamento[]> {
    return this.repo.findByCartao(cartaoId, userId);
  }

  async getById(id: string, userId: string): Promise<Parcelamento> {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("NOT_FOUND");
    return item;
  }

  async create(userId: string, cartaoId: string, data: CreateParcelamentoInput): Promise<Parcelamento> {
    const cartao = await this.cartaoRepo.findById(cartaoId, userId);
    if (!cartao) throw new Error("NOT_FOUND");

    return this.repo.create(userId, cartaoId, data);
  }

  async update(id: string, userId: string, data: UpdateParcelamentoInput): Promise<Parcelamento> {
    await this.getById(id, userId);
    return this.repo.update(id, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await this.repo.delete(id);
  }

  /** Calcula parcela atual e data de quitação a partir do mês de referência */
  static calcularInfo(p: Parcelamento, mesAnoRef: string) {
    const valorParcela = Number(p.valorTotal) / p.numeroParcelas;
    const [sy, sm] = p.mesInicio.split("-").map(Number);
    const [ry, rm] = mesAnoRef.split("-").map(Number);
    const parcelaAtual = Math.max(1, (ry - sy) * 12 + (rm - sm) + 1);
    const mesFim = addMonths(p.mesInicio, p.numeroParcelas - 1);
    return { valorParcela, parcelaAtual, mesFim };
  }
}
