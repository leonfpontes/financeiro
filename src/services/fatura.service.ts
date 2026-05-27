import { AssinaturaRepository } from "@/repositories/assinatura.repository";
import { ParcelamentoRepository } from "@/repositories/parcelamento.repository";
import { GastoAvulsoRepository } from "@/repositories/gasto-avulso.repository";
import { CartaoCreditoRepository } from "@/repositories/cartao-credito.repository";
import { Assinatura, GastoAvulsoCartao, Parcelamento } from "@/generated/prisma";
import { addMonths, subMonths, currentMesAno } from "@/lib/utils/date";

export interface FaturaDoMes {
  assinaturas: Assinatura[];
  parcelamentos: Array<Parcelamento & { valorParcela: number; parcelaAtual: number; mesFim: string }>;
  avulsos: GastoAvulsoCartao[];
  totalAssinaturas: number;
  totalParcelamentos: number;
  totalAvulsos: number;
  total: number;
}

export interface PontoHistorico {
  mesAno: string;
  total: number;
}

export interface RegressaoResult {
  insufficient: boolean;
  slope?: number;
  intercept?: number;
  forecast: Array<{ mesAno: string; valor: number }>;
}

export class FaturaService {
  constructor(
    private readonly assinaturaRepo: AssinaturaRepository = new AssinaturaRepository(),
    private readonly parcelamentoRepo: ParcelamentoRepository = new ParcelamentoRepository(),
    private readonly avulsoRepo: GastoAvulsoRepository = new GastoAvulsoRepository(),
    private readonly cartaoRepo: CartaoCreditoRepository = new CartaoCreditoRepository(),
  ) {}

  async getFaturaDoMes(userId: string, cartaoId: string, mesAno: string): Promise<FaturaDoMes> {
    const cartao = await this.cartaoRepo.findById(cartaoId, userId);
    if (!cartao) throw new Error("NOT_FOUND");

    const [assinaturas, parcelamentosRaw, avulsos] = await Promise.all([
      this.assinaturaRepo.findActiveInMonth(cartaoId, userId, mesAno),
      this.parcelamentoRepo.findActiveInMonth(cartaoId, userId, mesAno),
      this.avulsoRepo.findByCartaoMes(cartaoId, userId, mesAno),
    ]);

    const totalAssinaturas = assinaturas.reduce((s, a) => s + Number(a.valor), 0);

    const parcelamentos = parcelamentosRaw.map((p) => {
      const valorParcela = Number(p.valorTotal) / p.numeroParcelas;
      const [sy, sm] = p.mesInicio.split("-").map(Number);
      const [ry, rm] = mesAno.split("-").map(Number);
      const parcelaAtual = Math.max(1, (ry - sy) * 12 + (rm - sm) + 1);
      const mesFim = addMonths(p.mesInicio, p.numeroParcelas - 1);
      return { ...p, valorParcela, parcelaAtual, mesFim };
    });

    const totalParcelamentos = parcelamentos.reduce((s, p) => s + p.valorParcela, 0);
    const totalAvulsos = avulsos.reduce((s, a) => s + Number(a.valor), 0);

    return {
      assinaturas,
      parcelamentos,
      avulsos,
      totalAssinaturas,
      totalParcelamentos,
      totalAvulsos,
      total: totalAssinaturas + totalParcelamentos + totalAvulsos,
    };
  }

  /** Returns fatura totals for the last N CLOSED months (excludes current month) */
  async getHistoricoFatura(userId: string, cartaoId: string, meses = 6): Promise<PontoHistorico[]> {
    const hoje = currentMesAno();
    const mesAnoList = Array.from({ length: meses }, (_, i) => subMonths(hoje, meses - i));
    const faturas = await Promise.all(
      mesAnoList.map((mesAno) => this.getFaturaDoMes(userId, cartaoId, mesAno)),
    );
    return mesAnoList.map((mesAno, i) => ({ mesAno, total: faturas[i].total }));
  }

  calcularRegressao(pontos: PontoHistorico[], forecastMeses = 3): RegressaoResult {
    if (pontos.length < 2) return { insufficient: true, forecast: [] };

    const n = pontos.length;
    const xs = pontos.map((_, i) => i);
    const ys = pontos.map((p) => p.total);

    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { insufficient: true, forecast: [] };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const ultimoMes = pontos[pontos.length - 1].mesAno;
    const forecast = Array.from({ length: forecastMeses }, (_, i) => ({
      mesAno: addMonths(ultimoMes, i + 1),
      valor: Math.max(0, intercept + slope * (n + i)),
    }));

    return { insufficient: false, slope, intercept, forecast };
  }

  async getFaturaTotalUsuario(userId: string, mesAno: string): Promise<number> {
    const cartoes = await this.cartaoRepo.findAll(userId);
    let total = 0;
    for (const cartao of cartoes) {
      if (!cartao.ativo) continue;
      const fatura = await this.getFaturaDoMes(userId, cartao.id, mesAno);
      total += fatura.total;
    }
    return total;
  }

  async getFaturaResumoTodosCartoes(userId: string, mesAno: string) {
    const cartoes = await this.cartaoRepo.findAll(userId);
    return Promise.all(
      cartoes
        .filter((c) => c.ativo)
        .map(async (c) => {
          const fatura = await this.getFaturaDoMes(userId, c.id, mesAno);
          return { cartaoId: c.id, nome: c.nome, cor: c.cor, limite: Number(c.limite), total: fatura.total };
        }),
    );
  }
}
