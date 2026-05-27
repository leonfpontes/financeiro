// @ts-nocheck — seed file: schema was fully rebuilt; old helpers removed
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

const d = (s: string) => new Date(s);

async function main() {
  // ── Usuário demo ──────────────────────────────────────────────────────────
  const seedEmail    = process.env.SEED_USER_EMAIL;
  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedEmail || !seedPassword) {
    throw new Error("SEED_USER_EMAIL e SEED_USER_PASSWORD são obrigatórios.");
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const user = await prisma.user.upsert({
    where:  { email: seedEmail },
    update: { name: "Marcos & Júlia", passwordHash },
    create: { name: "Marcos & Júlia", email: seedEmail, passwordHash },
  });
  console.log(`✓ Usuário: ${user.name} (${user.email})`);

  // ── Limpar dados anteriores ───────────────────────────────────────────────
  await prisma.faturaPagamento.deleteMany({ where: { userId: user.id } });
  await prisma.gastoAvulsoCartao.deleteMany({ where: { userId: user.id } });
  await prisma.parcelamento.deleteMany({ where: { userId: user.id } });
  await prisma.assinatura.deleteMany({ where: { userId: user.id } });
  await prisma.cartaoCredito.deleteMany({ where: { userId: user.id } });
  await prisma.snapshotMensal.deleteMany({ where: { userId: user.id } });
  await prisma.realizadoMensal.deleteMany({ where: { userId: user.id } });
  await prisma.configUsuario.deleteMany({ where: { userId: user.id } });
  await prisma.compromisso.deleteMany({ where: { userId: user.id } });
  await prisma.gasto.deleteMany({ where: { userId: user.id } });
  await prisma.entrada.deleteMany({ where: { userId: user.id } });
  console.log("✓ Dados anteriores removidos");

  // =========================================================================
  // ENTRADAS — Marcos (Dev Sênior PJ) + Júlia (Médica Residente) + Freela
  // Total planejado: R$ 21.000/mês
  // =========================================================================
  await prisma.entrada.createMany({ data: [
    { nome: "Salário Marcos — Desenvolvedor Sênior (PJ)", tipo: "FIXA",    valor: 11000, notas: "Nota fiscal emitida todo dia 5.", userId: user.id },
    { nome: "Salário Júlia — Médica Residente (HCFMUSP)", tipo: "FIXA",    valor: 7500,  notas: "Salário + gratificação plantão. Creditado todo dia 5.", userId: user.id },
    { nome: "Consultoria técnica / Freela (Marcos)",      tipo: "VARIAVEL", valor: 2500,  notas: "Projetos pontuais de sistemas web. Valor médio mensal.", userId: user.id },
  ]});
  console.log("✓ Entradas criadas  (R$ 21.000 planejado)");

  // =========================================================================
  // GASTOS FIXOS — R$ 5.670/mês
  // =========================================================================
  await prisma.gasto.createMany({ data: [
    { nome: "Aluguel — Pinheiros, SP",          tipo: "FIXO", valor: 3500, dataInicio: d("2023-03-01"), icone: "home",        notas: "65 m², 2 quartos. Reajuste anual pelo IGPM.", userId: user.id },
    { nome: "Condomínio",                        tipo: "FIXO", valor: 580,  dataInicio: d("2023-03-01"), icone: "building",    userId: user.id },
    { nome: "Plano de saúde casal (Amil 400)",   tipo: "FIXO", valor: 1200, dataInicio: d("2023-03-01"), icone: "heart-pulse", notas: "Cobertura nacional, pronto-socorro incluído.", userId: user.id },
    { nome: "Academia Marcos (Smart Fit Gold)",  tipo: "FIXO", valor: 120,  dataInicio: d("2024-01-01"), icone: "dumbbell",    userId: user.id },
    { nome: "Academia Júlia (Smart Fit Gold)",   tipo: "FIXO", valor: 120,  dataInicio: d("2024-01-01"), icone: "dumbbell",    userId: user.id },
    { nome: "Internet fibra 500 MB (Vivo)",      tipo: "FIXO", valor: 150,  dataInicio: d("2023-03-01"), icone: "wifi",        userId: user.id },
  ]});

  // =========================================================================
  // GASTOS VARIÁVEIS — R$ 2.930/mês
  // =========================================================================
  await prisma.gasto.createMany({ data: [
    { nome: "Mercado / supermercado", tipo: "VARIAVEL", valor: 1400, periodoInput: "MENSAL", dataInicio: d("2023-03-01"), icone: "shopping-cart", notas: "Média dos últimos 6 meses. Inclui hortifrúti.", userId: user.id },
    { nome: "Combustível",            tipo: "VARIAVEL", valor: 550,  periodoInput: "MENSAL", dataInicio: d("2023-03-01"), icone: "car",           notas: "VW Polo flex, ~12 km/l urbano.", userId: user.id },
    { nome: "Lazer e restaurantes",   tipo: "VARIAVEL", valor: 700,  periodoInput: "MENSAL", dataInicio: d("2023-03-01"), icone: "utensils",      notas: "Jantares, cinema, bares e happy hour.", userId: user.id },
    { nome: "Saúde e farmácia",       tipo: "VARIAVEL", valor: 280,  periodoInput: "MENSAL", dataInicio: d("2023-03-01"), icone: "pill",          notas: "Consultas particulares fora do plano e medicamentos.", userId: user.id },
  ]});

  // =========================================================================
  // GASTOS SAZONAIS
  // =========================================================================
  await prisma.gasto.createMany({ data: [
    { nome: "IPTU — parcela mensal (10×)",        tipo: "SAZONAL", valor: 420,  mesesOcorrencia: [1,2,3,4,5,6,7,8,9,10], dataInicio: d("2024-01-01"), icone: "landmark", notas: "Parcelado sem juros. Vencimento dia 10.",         userId: user.id },
    { nome: "IPVA + Licenciamento",               tipo: "SAZONAL", valor: 1200, mesesOcorrencia: [1],                      dataInicio: d("2024-01-01"), icone: "car",      notas: "VW Polo 2022. Cota única com 5% de desconto.",   userId: user.id },
    { nome: "Presentes de Natal e Ano Novo",      tipo: "SAZONAL", valor: 1200, mesesOcorrencia: [12],                     dataInicio: d("2024-12-01"), icone: "gift",     notas: "Família (4 pessoas), amigo secreto e ceia.",     userId: user.id },
    { nome: "Material escolar (ajuda sobrinha)",  tipo: "SAZONAL", valor: 450,  mesesOcorrencia: [1,7],                    dataInicio: d("2024-01-01"), icone: "book",     notas: "Cadernos, livros e material — sobrinha da Júlia.", userId: user.id },
    { nome: "Revisão veicular anual",             tipo: "SAZONAL", valor: 650,  mesesOcorrencia: [3],                      dataInicio: d("2024-03-01"), icone: "wrench",   notas: "Revisão 40.000 km + óleo, filtros e pastilhas.", userId: user.id },
    { nome: "Viagem de férias — julho",           tipo: "SAZONAL", valor: 2800, mesesOcorrencia: [7],                      dataInicio: d("2024-07-01"), icone: "plane",    notas: "Hospedagem + passeios. Destino a definir.",      userId: user.id },
    { nome: "Presente Dia das Mães",              tipo: "SAZONAL", valor: 280,  mesesOcorrencia: [5],                      dataInicio: d("2024-05-01"), icone: "flower",   notas: "Jantar + presente para as mães do casal.",       userId: user.id },
    { nome: "Presente Dia dos Pais",              tipo: "SAZONAL", valor: 280,  mesesOcorrencia: [8],                      dataInicio: d("2024-08-01"), icone: "flower",   notas: "Jantar + presente para os pais do casal.",       userId: user.id },
  ]});
  console.log("✓ Gastos criados  (6 fixos · 4 variáveis · 8 sazonais)");

  // =========================================================================
  // COMPROMISSOS — R$ 5.230/mês
  // =========================================================================
  await prisma.compromisso.createMany({ data: [
    { nome: "Financiamento VW Polo 2022 (Santander)",          tipo: "DIVIDA",       valorMensal: 1350, notas: "48× de R$ 1.350. Quitação: set/2026. Saldo devedor ~R$ 18.900.", userId: user.id },
    { nome: "Empréstimo pessoal — reforma cozinha (Bradesco)", tipo: "DIVIDA",       valorMensal: 680,  notas: "24× de R$ 680. Quitação: jul/2026. Saldo devedor ~R$ 9.500.", userId: user.id },
    { nome: "Previdência privada VGBL (BTG Pactual)",          tipo: "INVESTIMENTO", valorMensal: 1000, notas: "Fundo BTG Prev Moderado. Taxa 0,8% a.a. Prazo longo.", userId: user.id },
    { nome: "Tesouro Direto IPCA+ 2035",                       tipo: "INVESTIMENTO", valorMensal: 600,  notas: "Aporte via Banco Inter. IPCA + 6,2% a.a. Objetivo: aposentadoria.", userId: user.id },
    { nome: "CDB 120% CDI — Banco Inter",                      tipo: "INVESTIMENTO", valorMensal: 400,  notas: "Reserva de liquidez, resgate D+1. Acumulado: R$ 14.200.", userId: user.id },
    { nome: "Entrada do apartamento próprio",                  tipo: "SONHO",        valorMensal: 1200, metaTotal: 80000, dataAlvo: d("2027-12-01"), notas: "Meta: 20% de entrada p/ apê ~R$ 400k no Brooklin ou Moema. Acumulado: R$ 28.800.", userId: user.id },
  ]});
  console.log("✓ Compromissos criados  (2 dívidas · 3 investimentos · 1 sonho)");

  // =========================================================================
  // CONFIGURAÇÃO DO USUÁRIO
  // =========================================================================
  await prisma.configUsuario.create({ data: {
    userId: user.id,
    margemPercent: 20,
    tetoCreditCard: 3500,
    notasPlanoAcao: `PLANO DE AÇÃO 2026\n\n🎯 META PRINCIPAL\nPoupar R$ 80.000 para a entrada do apartamento até dezembro/2027.\nRitmo atual: R$ 1.200/mês → acumulado R$ 28.800 (36% da meta).\n\n✅ AÇÕES EM ANDAMENTO\n• Quitação empréstimo reforma em jul/2026 → libera R$ 680/mês\n  → Redirecionar: R$ 400 para CDB + R$ 280 para o sonho do apê\n• Financiamento carro quitado em set/2026 → libera R$ 1.350/mês\n  → Redirecionar: R$ 800 para Tesouro Direto + R$ 550 para o apê\n\n⚠️ PONTOS DE ATENÇÃO\n• Teto do cartão: R$ 3.500/mês em avulsos (parcelas fixas não contam)\n• Consultoria freelance é variável — não usar para compromissos fixos\n• Revisitar assinaturas no 2º semestre (possível cancelar Disney+)`,
  }});
  console.log("✓ Config criada  (margem-alvo 20% · teto cartão R$ 3.500)");

  // =========================================================================
  // CARTÕES DE CRÉDITO
  // =========================================================================
  const nubank = await prisma.cartaoCredito.create({ data: { nome: "Nubank Ultravioleta", limite: 18000, diaVencimento: 5,  cor: "#820AD1", userId: user.id }});
  const itau   = await prisma.cartaoCredito.create({ data: { nome: "Itaú Platinum Visa",   limite: 12000, diaVencimento: 12, cor: "#EC7000", userId: user.id }});
  console.log("✓ Cartões criados  (Nubank R$ 18k · Itaú R$ 12k)");

  // =========================================================================
  // ASSINATURAS — R$ 319,30/mês
  // Nubank: 146,60 · Itaú: 172,70
  // =========================================================================
  await prisma.assinatura.createMany({ data: [
    { nome: "Netflix Ultra (4K)",                     valor: 55.90, dataInicio: "2024-03", icone: "tv",         cartaoId: nubank.id, userId: user.id },
    { nome: "Spotify Family",                         valor: 26.90, dataInicio: "2023-08", icone: "music",      cartaoId: nubank.id, userId: user.id },
    { nome: "Amazon Prime",                           valor: 19.90, dataInicio: "2023-01", icone: "package",    cartaoId: nubank.id, userId: user.id },
    { nome: "Disney+ Premium",                        valor: 43.90, dataInicio: "2024-01", icone: "star",       cartaoId: nubank.id, userId: user.id },
    { nome: "Plano celular Marcos (Claro Controle)",  valor: 89.90, dataInicio: "2022-05", icone: "smartphone", cartaoId: itau.id,   userId: user.id },
    { nome: "Plano celular Júlia (Vivo Controle)",    valor: 69.90, dataInicio: "2023-03", icone: "smartphone", cartaoId: itau.id,   userId: user.id },
    { nome: "iCloud 200 GB",                          valor: 12.90, dataInicio: "2023-06", icone: "cloud",      cartaoId: itau.id,   userId: user.id },
  ]});
  console.log("✓ Assinaturas criadas  (R$ 319,30/mês)");

  // =========================================================================
  // PARCELAMENTOS
  // Nubank: iPhone 700/mês (até jul/26) + Passagens 350/mês (até jun/26)
  // Itaú:   SmartTV 300/mês (até mai/26) + Geladeira 320/mês (até jun/26)
  // Total parcelas: R$ 1.670/mês
  // =========================================================================
  await prisma.parcelamento.createMany({ data: [
    { nome: "iPhone 15 Pro 256 GB — Marcos",           valorTotal: 8400, numeroParcelas: 12, mesInicio: "2025-08", icone: "smartphone", notas: "12× de R$ 700. Ativo até jul/2026.",           cartaoId: nubank.id, userId: user.id },
    { nome: "Passagens aéreas — Florianópolis jan/26", valorTotal: 2100, numeroParcelas: 6,  mesInicio: "2026-01", icone: "plane",      notas: "6× de R$ 350. GRU–FLN ida e volta, 2 pax.",  cartaoId: nubank.id, userId: user.id },
    { nome: "Smart TV LG OLED 65\" (sala)",            valorTotal: 3600, numeroParcelas: 12, mesInicio: "2025-06", icone: "monitor",    notas: "12× de R$ 300. Última parcela: mai/2026.",    cartaoId: itau.id,   userId: user.id },
    { nome: "Geladeira Brastemp Inverse 500L",         valorTotal: 3200, numeroParcelas: 10, mesInicio: "2025-09", icone: "archive",    notas: "10× de R$ 320. Ativo até jun/2026.",           cartaoId: itau.id,   userId: user.id },
  ]});
  console.log("✓ Parcelamentos criados  (R$ 1.670/mês em parcelas)");

  // =========================================================================
  // GASTOS AVULSOS POR CARTÃO E MÊS
  // =========================================================================
  const av = (nome: string, valor: number, mesAno: string, cartaoId: string, icone?: string, notas?: string) =>
    ({ nome, valor, mesAno, cartaoId, icone, notas, userId: user.id });

  await prisma.gastoAvulsoCartao.createMany({ data: [
    // Dezembro 2025 — Natal, Réveillon
    av("Presentes de Natal — Amazon + shoppings",       580, "2025-12", nubank.id, "gift"),
    av("Confraternização empresa Marcos",               320, "2025-12", nubank.id, "users"),
    av("Roupas para festas de fim de ano",              290, "2025-12", itau.id,   "tag"),
    av("Voucher restaurante — Réveillon",               450, "2025-12", itau.id,   "utensils", "Restaurante Vista, Jardins"),

    // Janeiro 2026 — educação, casa
    av("Alura — renovação assinatura anual",           1200, "2026-01", nubank.id, "book",          "React, Node.js, AWS Solutions Architect"),
    av("Livros técnicos (Amazon)",                      180, "2026-01", nubank.id, "book"),
    av("Farmácia verão — protetor solar e vitaminas",   120, "2026-01", itau.id,   "pill"),
    av("Decoração apartamento (Tok&Stok)",              250, "2026-01", itau.id,   "home"),

    // Fevereiro 2026 — Dia dos Namorados, Carnaval
    av("Jantar Dia dos Namorados — La Pasta",           380, "2026-02", nubank.id, "heart",         "Restaurante La Pasta, Vila Madalena"),
    av("Perfume + presente Júlia",                      220, "2026-02", nubank.id, "gift"),
    av("Ingressos bloco de carnaval (2 pessoas)",       160, "2026-02", itau.id,   "music"),
    av("Fantasias para o carnaval",                     240, "2026-02", itau.id,   "star"),

    // Março 2026 — Páscoa, manutenção carro
    av("Almoço família Páscoa (restaurante, 8 pax)",    280, "2026-03", nubank.id, "utensils"),
    av("Ovos de Páscoa artesanais",                     150, "2026-03", nubank.id, "gift"),
    av("2 pneus traseiros — VW Polo (Pirelli P7)",      480, "2026-03", itau.id,   "car",           "Inclui alinhamento e balanceamento"),
    av("Materiais manutenção apartamento",              160, "2026-03", itau.id,   "wrench"),

    // Abril 2026 — show Coldplay
    av("Show Coldplay SP — 2 ingressos Pista Premium",  640, "2026-04", nubank.id, "music",         "Allianz Parque, 21 abr. Music of the Spheres Tour"),
    av("Bar pós-show e transporte",                     190, "2026-04", nubank.id, "wine"),
    av("Farmácia geral",                                 95, "2026-04", itau.id,   "pill"),
    av("Artigos decoração Semana Santa",                 85, "2026-04", itau.id,   "home"),

    // Maio 2026 — Dia das Mães, manutenção AC
    av("Jantar Dia das Mães — família (10 pessoas)",    520, "2026-05", nubank.id, "utensils",      "Restaurante Dalva e Dito, Jardins"),
    av("Compras online gerais (Mercado Livre)",          195, "2026-05", nubank.id, "shopping-cart"),
    av("Manutenção ar condicionado split (2 unidades)", 220, "2026-05", itau.id,   "wind"),
    av("Farmácia geral",                                  85, "2026-05", itau.id,   "pill"),
  ]});
  console.log("✓ Gastos avulsos criados  (6 meses × 2 cartões)");

  // =========================================================================
  // PAGAMENTOS DE FATURA
  // Dez/25–Abr/26 pagos · Mai/26 em aberto
  // =========================================================================
  const mesesFechados = ["2025-12", "2026-01", "2026-02", "2026-03", "2026-04"];
  const pagRows: { cartaoId: string; userId: string; mesAno: string; pago: boolean; dataPagamento?: Date }[] = [];

  for (const mesAno of mesesFechados) {
    const [ano, mes] = mesAno.split("-").map(Number);
    const nextY = mes === 12 ? ano + 1 : ano;
    const nextM = mes === 12 ? 1 : mes + 1;
    pagRows.push({ cartaoId: nubank.id, userId: user.id, mesAno, pago: true, dataPagamento: new Date(nextY, nextM - 1, 5)  });
    pagRows.push({ cartaoId: itau.id,   userId: user.id, mesAno, pago: true, dataPagamento: new Date(nextY, nextM - 1, 12) });
  }
  pagRows.push({ cartaoId: nubank.id, userId: user.id, mesAno: "2026-05", pago: false });
  pagRows.push({ cartaoId: itau.id,   userId: user.id, mesAno: "2026-05", pago: false });
  await prisma.faturaPagamento.createMany({ data: pagRows });
  console.log("✓ Faturas criadas  (dez/25–abr/26 pagas · mai/26 em aberto)");

  // =========================================================================
  // REALIZADO MENSAL (30 registros — 6 meses × 5 grupos)
  // =========================================================================
  type GR = "ENTRADAS"|"GASTOS_FIXOS"|"GASTOS_VARIAVEIS"|"GASTOS_SAZONAIS"|"COMPROMISSOS";
  const rm = (mesAno: string, grupo: GR, valorRealizado: number) =>
    ({ mesAno, grupo, valorRealizado, userId: user.id });

  await prisma.realizadoMensal.createMany({ data: [
    // Dez/25 — consultoria forte; festas inflam variáveis
    rm("2025-12","ENTRADAS",         22200), rm("2025-12","GASTOS_FIXOS",     5670),
    rm("2025-12","GASTOS_VARIAVEIS", 3450),  rm("2025-12","GASTOS_SAZONAIS",  1200), rm("2025-12","COMPROMISSOS", 5230),
    // Jan/26 — IPTU+IPVA pesam; consultoria fraca
    rm("2026-01","ENTRADAS",         20500), rm("2026-01","GASTOS_FIXOS",     5670),
    rm("2026-01","GASTOS_VARIAVEIS", 3150),  rm("2026-01","GASTOS_SAZONAIS",  2070), rm("2026-01","COMPROMISSOS", 5230),
    // Fev/26 — mês curto, Carnaval; ligeiramente abaixo do planejado
    rm("2026-02","ENTRADAS",         21500), rm("2026-02","GASTOS_FIXOS",     5670),
    rm("2026-02","GASTOS_VARIAVEIS", 2820),  rm("2026-02","GASTOS_SAZONAIS",   420), rm("2026-02","COMPROMISSOS", 5230),
    // Mar/26 — revisão + Páscoa elevam variáveis
    rm("2026-03","ENTRADAS",         21000), rm("2026-03","GASTOS_FIXOS",     5670),
    rm("2026-03","GASTOS_VARIAVEIS", 3100),  rm("2026-03","GASTOS_SAZONAIS",  1070), rm("2026-03","COMPROMISSOS", 5230),
    // Abr/26 — show Coldplay; mercado levemente abaixo
    rm("2026-04","ENTRADAS",         21000), rm("2026-04","GASTOS_FIXOS",     5670),
    rm("2026-04","GASTOS_VARIAVEIS", 2950),  rm("2026-04","GASTOS_SAZONAIS",   420), rm("2026-04","COMPROMISSOS", 5230),
    // Mai/26 — parcial dia 27; freela pendente de faturamento
    rm("2026-05","ENTRADAS",         18500), rm("2026-05","GASTOS_FIXOS",     5670),
    rm("2026-05","GASTOS_VARIAVEIS", 2150),  rm("2026-05","GASTOS_SAZONAIS",   700), rm("2026-05","COMPROMISSOS", 5230),
  ]});
  console.log("✓ Realizado mensal criado  (30 registros)");

  // =========================================================================
  // SNAPSHOTS MENSAIS
  // gastosCartoes = assinaturas(319) + parcelas aplicáveis
  //   Dez/25: 319+700+300+320         = 1.639  (passagens iniciam jan/26)
  //   Jan–Mai/26: 319+700+350+300+320 = 1.989
  // margem = entradas − fixos − variáveis − sazonais − compromissos − cartões
  // =========================================================================
  await prisma.snapshotMensal.createMany({ data: [
    { mesAno:"2025-12", entradas:21000, gastosFixos:5670, gastosVariaveis:2930, gastosSazonais:1200, compromissos:5230, gastosCartoes:1639, margem:4331, margemPercent:20.62, userId:user.id },
    { mesAno:"2026-01", entradas:21000, gastosFixos:5670, gastosVariaveis:2930, gastosSazonais:2070, compromissos:5230, gastosCartoes:1989, margem:3111, margemPercent:14.82, userId:user.id },
    { mesAno:"2026-02", entradas:21000, gastosFixos:5670, gastosVariaveis:2930, gastosSazonais: 420, compromissos:5230, gastosCartoes:1989, margem:4761, margemPercent:22.67, userId:user.id },
    { mesAno:"2026-03", entradas:21000, gastosFixos:5670, gastosVariaveis:2930, gastosSazonais:1070, compromissos:5230, gastosCartoes:1989, margem:4111, margemPercent:19.58, userId:user.id },
    { mesAno:"2026-04", entradas:21000, gastosFixos:5670, gastosVariaveis:2930, gastosSazonais: 420, compromissos:5230, gastosCartoes:1989, margem:4761, margemPercent:22.67, userId:user.id },
    { mesAno:"2026-05", entradas:21000, gastosFixos:5670, gastosVariaveis:2930, gastosSazonais: 700, compromissos:5230, gastosCartoes:1989, margem:4481, margemPercent:21.34, userId:user.id },
  ]});
  console.log("✓ Snapshots criados  (dez/25 → mai/26)");

  console.log("\n✅ Seed concluído!");
  console.log("─────────────────────────────────────────");
  console.log(`  URL:   http://localhost:3002`);
  console.log(`  Login: ${seedEmail}`);
  console.log(`  Senha: ${seedPassword}`);
  console.log("─────────────────────────────────────────");
  console.log("  Cenário: Marcos & Júlia — Pinheiros, SP");
  console.log("  Renda planejada: R$ 21.000/mês");
  console.log("  Margem média:    ~20%");
  console.log("  Sonho:           Entrada apê até dez/2027");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
