import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function toYearMonth(year: number, month: number) {
  return year * 100 + month;
}
function d(year: number, month: number, day: number) {
  return new Date(year, month - 1, day);
}

async function main() {
  // ── Usuário demo ──────────────────────────────────────────────────────────
  const seedEmail = process.env.SEED_USER_EMAIL;
  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedEmail || !seedPassword) {
    throw new Error("SEED_USER_EMAIL e SEED_USER_PASSWORD são obrigatórios. Defina no .env antes de rodar o seed.");
  }
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: { name: "Leonardo & Camila" },
    create: { name: "Leonardo & Camila", email: seedEmail, passwordHash },
  });

  // ── Categorias ────────────────────────────────────────────────────────────
  const expenseDefs = [
    { key: "alimentacao", name: "Alimentação",       color: "#ef4444", icon: "utensils" },
    { key: "transporte",  name: "Transporte",         color: "#f97316", icon: "car" },
    { key: "moradia",     name: "Moradia",            color: "#eab308", icon: "home" },
    { key: "saude",       name: "Saúde",              color: "#22c55e", icon: "heart" },
    { key: "educacao",    name: "Educação",           color: "#3b82f6", icon: "book" },
    { key: "lazer",       name: "Lazer",              color: "#8b5cf6", icon: "star" },
    { key: "vestuario",   name: "Vestuário",          color: "#ec4899", icon: "tag" },
    { key: "servicos",    name: "Serviços",           color: "#14b8a6", icon: "zap" },
    { key: "pets",        name: "Pets — Rotina",      color: "#f59e0b", icon: "paw-print" },
    { key: "petsaude",    name: "Pets — Saúde",       color: "#dc2626", icon: "syringe" },
    { key: "pensao",      name: "Pensão",             color: "#7c3aed", icon: "users" },
    { key: "religioso",   name: "Espiritualidade",    color: "#a78bfa", icon: "flame" },
    { key: "outros",      name: "Outros",             color: "#6b7280", icon: "circle" },
  ];
  const incomeDefs = [
    { key: "salario",     name: "Salário",            color: "#22c55e", icon: "briefcase" },
    { key: "rendaextra",  name: "Renda Extra",        color: "#0ea5e9", icon: "plus-circle" },
    { key: "outras",      name: "Outras Receitas",    color: "#84cc16", icon: "circle" },
  ];

  const catId = (key: string) => `seed-${key}-${user.id}`;

  for (const cat of expenseDefs) {
    await prisma.category.upsert({
      where: { id: catId(cat.key) },
      update: {},
      create: { id: catId(cat.key), name: cat.name, color: cat.color, icon: cat.icon, type: "EXPENSE", userId: user.id },
    });
  }
  for (const cat of incomeDefs) {
    await prisma.category.upsert({
      where: { id: catId(cat.key) },
      update: {},
      create: { id: catId(cat.key), name: cat.name, color: cat.color, icon: cat.icon, type: "INCOME", userId: user.id },
    });
  }

  // ── Orçamentos mensais ────────────────────────────────────────────────────
  const budgetDefs = [
    { key: "alimentacao", amount: 1500 },
    { key: "transporte",  amount: 700  },
    { key: "moradia",     amount: 3600 },
    { key: "saude",       amount: 900  },
    { key: "lazer",       amount: 600  },
    { key: "pets",        amount: 600  },
    { key: "petsaude",    amount: 1500 },
    { key: "pensao",      amount: 1700 },
    { key: "religioso",   amount: 250  },
    { key: "servicos",    amount: 400  },
  ];
  const months6 = [
    { year: 2025, month: 12 },
    { year: 2026, month: 1  },
    { year: 2026, month: 2  },
    { year: 2026, month: 3  },
    { year: 2026, month: 4  },
    { year: 2026, month: 5  },
  ];
  for (const { year, month } of months6) {
    for (const b of budgetDefs) {
      await prisma.budget.upsert({
        where: { categoryId_userId_month_year: { categoryId: catId(b.key), userId: user.id, month, year } },
        update: {},
        create: { categoryId: catId(b.key), userId: user.id, month, year, limitAmount: b.amount },
      });
    }
  }

  // ── Helper criar transação ────────────────────────────────────────────────
  let txCounter = 0;
  async function tx(
    year: number, month: number, day: number,
    description: string, amount: number,
    type: "INCOME" | "EXPENSE",
    catKey: string,
    paymentMethod: "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "BANK_TRANSFER" | "OTHER" = "PIX",
    notes?: string,
  ) {
    txCounter++;
    await prisma.transaction.create({
      data: {
        id: `seed-tx-${txCounter}-${user.id}`,
        date: d(year, month, day),
        description, amount, type, paymentMethod, notes,
        yearMonth: toYearMonth(year, month),
        userId: user.id,
        categoryId: catId(catKey),
      },
    });
  }

  // Limpar seed anterior
  await prisma.transaction.deleteMany({ where: { userId: user.id, id: { startsWith: "seed-tx-" } } });
  txCounter = 0;

  // ══════════════════════════════════════════════════════════════════════════
  // DEZEMBRO 2025
  // Pitoca: 1ª internação do mês — diagnóstico de DRC + anemia confirmado
  // ══════════════════════════════════════════════════════════════════════════

  // Receitas
  await tx(2025,12, 5, "Salário Leonardo — dezembro",         15000, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2025,12, 5, "Salário Camila — Hemocentro RP",       4800, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2025,12,20, "13º Leonardo",                        15000, "INCOME", "rendaextra", "BANK_TRANSFER", "13º salário integral");
  await tx(2025,12,20, "13º Camila — Hemocentro",              4800, "INCOME", "rendaextra", "BANK_TRANSFER", "13º salário integral");
  await tx(2025,12,20, "Aulas ETEC Serrana — Camila",         1100,  "INCOME", "rendaextra", "BANK_TRANSFER", "Novembro/Dezembro");

  // Moradia (Ribeirão Preto)
  await tx(2025,12, 5, "Aluguel",                             2800,  "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2025,12, 5, "Condomínio",                          450,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2025,12,12, "Conta de luz (home office)",          380,   "EXPENSE", "moradia",   "DEBIT_CARD", "Leo trabalha em casa — consumo elevado");
  await tx(2025,12,12, "Conta de água",                       95,    "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2025,12,15, "Internet fibra 400mb",                130,   "EXPENSE", "servicos",  "DEBIT_CARD");

  // Pensão
  await tx(2025,12, 5, "Pensão — filha",                      1700,  "EXPENSE", "pensao",    "BANK_TRANSFER", "Pagamento via transferência judicial");

  // Serviços / assinaturas
  await tx(2025,12, 8, "Netflix",                             45,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2025,12, 8, "Spotify Family",                      22,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2025,12, 8, "Plano de saúde casal",               680,   "EXPENSE", "saude",     "BANK_TRANSFER");
  await tx(2025,12,10, "Flamenco Camila — mensalidade",      220,   "EXPENSE", "lazer",     "PIX", "Studio Flamenco Ribeirão");

  // Alimentação
  await tx(2025,12, 3, "Mercado Semanal",                     420,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2025,12,10, "Mercado Semanal",                     380,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2025,12,17, "Mercado Semanal",                     395,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2025,12,24, "Ceia de Natal — mercado",             520,   "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2025,12,28, "Feira livre",                         85,    "EXPENSE", "alimentacao","CASH");
  await tx(2025,12, 7, "iFood — sábado",                      92,    "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2025,12,14, "Jantar fim de ano — restaurante",     210,   "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2025,12,31, "Réveillon — restaurante",             280,   "EXPENSE", "alimentacao","CREDIT_CARD");

  // Transporte (Camila presencial — RP a Serrana ~25km)
  await tx(2025,12, 2, "Gasolina — Camila",                   320,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2025,12,16, "Gasolina — Camila",                   300,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2025,12,20, "Estacionamento shopping",             40,    "EXPENSE", "transporte","CASH");

  // Pets — rotina (Mingau, Pudim, Nico — Pitoca está em ração terapêutica)
  await tx(2025,12, 5, "Ração Royal Canin — Mingau, Pudim, Nico", 360, "EXPENSE","pets",    "CREDIT_CARD");
  await tx(2025,12, 5, "Ração Hills k/d — Pitoca (renal)",   145,   "EXPENSE", "pets",      "PIX", "Dieta terapêutica renal");
  await tx(2025,12, 8, "Areia higiênica 2x",                 95,    "EXPENSE", "pets",      "PIX");

  // Pitoca — 1ª internação: DRC confirmada + crise anêmica
  await tx(2025,12,10, "Consulta nefro felino — Pitoca",     320,   "EXPENSE", "petsaude",  "PIX", "Diagnóstico: DRC estágio 3 + anemia hemolítica");
  await tx(2025,12,10, "Exames Pitoca — hemograma + creatinina + ureia", 380, "EXPENSE","petsaude","PIX");
  await tx(2025,12,11, "Internação Pitoca (4 dias) — fluidoterapia + EPO", 1800,"EXPENSE","petsaude","PIX","1ª internação — estabilização hemodinâmica");
  await tx(2025,12,15, "Alta Pitoca — medicamentos",         480,   "EXPENSE", "petsaude",  "PIX", "EPO injetável, fosfato quelante, suplemento renal");
  await tx(2025,12,20, "Vacinas anuais — Mingau, Pudim, Nico", 360, "EXPENSE","petsaude",  "PIX", "V4 + raiva — 3 gatos");

  // Espiritualidade
  await tx(2025,12, 8, "Velas, incensos e ervas — Leonardo", 165,   "EXPENSE", "religioso", "CASH");
  await tx(2025,12,22, "Oferendas e itens rituais",           120,   "EXPENSE", "religioso", "CASH");

  // Lazer / presentes
  await tx(2025,12,22, "Presentes de Natal — família",       390,   "EXPENSE", "lazer",     "CREDIT_CARD");
  await tx(2025,12,26, "Passeio — parque com amigos",        85,    "EXPENSE", "lazer",     "CASH");

  // Saúde
  await tx(2025,12, 5, "Farmácia — Camila",                   72,    "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2025,12,18, "Dentista — Leonardo",                 350,   "EXPENSE", "saude",     "PIX");

  // Vestuário
  await tx(2025,12,23, "Roupas Natal",                        290,   "EXPENSE", "vestuario", "CREDIT_CARD");

  // ══════════════════════════════════════════════════════════════════════════
  // JANEIRO 2026
  // Pitoca: estável em casa, controle mensal. Nova crise no final do mês.
  // ══════════════════════════════════════════════════════════════════════════

  await tx(2026,1, 5, "Salário Leonardo — janeiro",          15000, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,1, 5, "Salário Camila — Hemocentro RP",       4800, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,1,20, "Aulas ETEC Serrana — Camila",         1100,  "INCOME", "rendaextra", "BANK_TRANSFER");

  await tx(2026,1, 5, "Aluguel",                             2800,  "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,1, 5, "Condomínio",                          450,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,1, 5, "Pensão — filha",                      1700,  "EXPENSE", "pensao",    "BANK_TRANSFER");
  await tx(2026,1,12, "IPTU 2026 — parcela 1/10",            340,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,1,14, "Conta de luz (verão intenso)",        420,   "EXPENSE", "moradia",   "DEBIT_CARD", "Ar condicionado + home office");
  await tx(2026,1,14, "Conta de água",                       98,    "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,1,15, "Internet fibra 400mb",                130,   "EXPENSE", "servicos",  "DEBIT_CARD");
  await tx(2026,1, 8, "Netflix",                             45,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,1, 8, "Spotify Family",                      22,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,1, 8, "Plano de saúde casal",               680,   "EXPENSE", "saude",     "BANK_TRANSFER");
  await tx(2026,1,10, "Flamenco Camila — mensalidade",      220,   "EXPENSE", "lazer",     "PIX");

  await tx(2026,1, 4, "Mercado Semanal",                     400,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,1,11, "Mercado Semanal",                     370,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,1,18, "Mercado Semanal",                     385,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,1,25, "Mercado Semanal",                     360,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,1,11, "Feira livre",                         80,    "EXPENSE", "alimentacao","CASH");
  await tx(2026,1,17, "iFood — sábado",                      88,    "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2026,1,24, "Churrasco fim de semana",             165,   "EXPENSE", "alimentacao","CREDIT_CARD");

  await tx(2026,1, 3, "Gasolina — Camila",                   310,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,1,17, "Gasolina — Camila",                   298,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,1,20, "Revisão carro — troca óleo + filtros",520,   "EXPENSE", "transporte","PIX");

  await tx(2026,1, 5, "Ração Royal Canin — Mingau, Pudim, Nico", 360,"EXPENSE","pets",     "CREDIT_CARD");
  await tx(2026,1, 5, "Ração Hills k/d — Pitoca",           145,   "EXPENSE", "pets",      "PIX");
  await tx(2026,1, 8, "Areia higiênica 2x",                 95,    "EXPENSE", "pets",      "PIX");
  // Pitoca controle mensal
  await tx(2026,1,12, "Consulta retorno — Pitoca",           280,   "EXPENSE", "petsaude",  "PIX");
  await tx(2026,1,12, "Exames mensais Pitoca — hemograma completo", 260,"EXPENSE","petsaude","PIX");
  await tx(2026,1,12, "Medicamentos Pitoca — EPO + fosfato quelante", 520,"EXPENSE","petsaude","PIX","Manutenção crônica");
  // Crise no final do mês
  await tx(2026,1,26, "Internação Pitoca (3 dias) — crise anêmica",1400,"EXPENSE","petsaude","PIX","Transfusão de sangue + fluidoterapia");
  await tx(2026,1,29, "Alta Pitoca — ajuste de medicação",   180,   "EXPENSE", "petsaude",  "PIX");

  await tx(2026,1, 8, "Velas, incensos — Leonardo & Camila", 145,  "EXPENSE", "religioso", "CASH");
  await tx(2026,1,25, "Livros e itens esotéricos",           90,    "EXPENSE", "religioso", "PIX");

  await tx(2026,1,18, "Show de verão",                       160,   "EXPENSE", "lazer",     "CREDIT_CARD");
  await tx(2026,1,25, "Bar com amigos",                      95,    "EXPENSE", "lazer",     "CASH");

  await tx(2026,1, 8, "Academia — Leonardo",                 120,   "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,1,10, "Farmácia",                            65,    "EXPENSE", "saude",     "DEBIT_CARD");

  await tx(2026,1,10, "Curso Udemy — Leonardo",              190,   "EXPENSE", "educacao",  "CREDIT_CARD", "React avançado + Next.js");

  // ══════════════════════════════════════════════════════════════════════════
  // FEVEREIRO 2026
  // Pitoca: controle, estabilização parcial. 3ª internação no fim do mês.
  // ══════════════════════════════════════════════════════════════════════════

  await tx(2026,2, 5, "Salário Leonardo — fevereiro",        15000, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,2, 5, "Salário Camila — Hemocentro RP",       4800, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,2,14, "Freela — Leonardo (sistema web)",     2800,  "INCOME", "rendaextra", "PIX", "Sistema de agendamento para clínica");
  await tx(2026,2,20, "Aulas ETEC Serrana — Camila",         1100,  "INCOME", "rendaextra", "BANK_TRANSFER");

  await tx(2026,2, 5, "Aluguel",                             2800,  "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,2, 5, "Condomínio",                          450,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,2, 5, "Pensão — filha",                      1700,  "EXPENSE", "pensao",    "BANK_TRANSFER");
  await tx(2026,2,12, "IPTU 2026 — parcela 2/10",            340,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,2,14, "Conta de luz",                        395,   "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,2,14, "Conta de água",                       95,    "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,2,15, "Internet fibra 400mb",                130,   "EXPENSE", "servicos",  "DEBIT_CARD");
  await tx(2026,2, 8, "Netflix",                             45,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,2, 8, "Spotify Family",                      22,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,2, 8, "Plano de saúde casal",               680,   "EXPENSE", "saude",     "BANK_TRANSFER");
  await tx(2026,2,10, "Flamenco Camila — mensalidade",      220,   "EXPENSE", "lazer",     "PIX");

  await tx(2026,2, 1, "Mercado Semanal",                     390,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,2, 8, "Mercado Semanal",                     365,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,2,15, "Mercado Semanal",                     380,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,2,22, "Mercado Semanal",                     355,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,2,14, "Jantar Dia dos Namorados",            240,   "EXPENSE", "alimentacao","CREDIT_CARD", "Restaurante italiano RP");
  await tx(2026,2, 7, "iFood — sábado",                      75,    "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2026,2,22, "Carnaval — alimentação",              190,   "EXPENSE", "alimentacao","CASH");

  await tx(2026,2, 5, "Gasolina — Camila",                   305,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,2,19, "Gasolina — Camila",                   290,   "EXPENSE", "transporte","CREDIT_CARD");

  await tx(2026,2, 5, "Ração Royal Canin — Mingau, Pudim, Nico", 360,"EXPENSE","pets",     "CREDIT_CARD");
  await tx(2026,2, 5, "Ração Hills k/d — Pitoca",           145,   "EXPENSE", "pets",      "PIX");
  await tx(2026,2, 8, "Areia higiênica 2x",                 95,    "EXPENSE", "pets",      "PIX");
  await tx(2026,2, 9, "Consulta retorno — Pitoca",           280,   "EXPENSE", "petsaude",  "PIX");
  await tx(2026,2, 9, "Exames mensais Pitoca",               270,   "EXPENSE", "petsaude",  "PIX", "Hemograma + função renal + eletrólitos");
  await tx(2026,2, 9, "Medicamentos Pitoca",                 540,   "EXPENSE", "petsaude",  "PIX", "EPO + fosfato quelante + vitamina B12");
  await tx(2026,2,20, "Check-up Mingau, Pudim, Nico",        420,   "EXPENSE", "petsaude",  "PIX", "Consulta + vacinação de reforço");
  // 3ª internação
  await tx(2026,2,24, "Internação Pitoca (5 dias) — piora renal", 2200,"EXPENSE","petsaude","PIX","Crise urémica — fluidoterapia intensiva + transfusão");
  await tx(2026,2,28, "Alta Pitoca — novo protocolo",        220,   "EXPENSE", "petsaude",  "PIX", "Ajuste de doses + nutrição parenteral");

  await tx(2026,2, 8, "Velas, incensos — Leonardo & Camila", 140,  "EXPENSE", "religioso", "CASH");
  await tx(2026,2,21, "Flores e oferendas — Carnaval",       85,    "EXPENSE", "religioso", "CASH");

  await tx(2026,2,14, "Flores e presente Dia dos Namorados", 180,   "EXPENSE", "lazer",     "PIX");
  await tx(2026,2,21, "Bloco de Carnaval",                   95,    "EXPENSE", "lazer",     "CASH");

  await tx(2026,2, 8, "Academia — Leonardo",                 120,   "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,2,10, "Dentista — Camila",                   290,   "EXPENSE", "saude",     "PIX");
  await tx(2026,2,18, "Farmácia",                            58,    "EXPENSE", "saude",     "DEBIT_CARD");

  // ══════════════════════════════════════════════════════════════════════════
  // MARÇO 2026
  // Pitoca: tentativa de estabilização. Nefrologista indica diálise peritoneal.
  // ══════════════════════════════════════════════════════════════════════════

  await tx(2026,3, 5, "Salário Leonardo — março",            15000, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,3, 5, "Salário Camila — Hemocentro RP",       4800, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,3,20, "Aulas ETEC Serrana — Camila",         1100,  "INCOME", "rendaextra", "BANK_TRANSFER");

  await tx(2026,3, 5, "Aluguel",                             2800,  "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,3, 5, "Condomínio",                          450,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,3, 5, "Pensão — filha",                      1700,  "EXPENSE", "pensao",    "BANK_TRANSFER");
  await tx(2026,3,12, "IPTU 2026 — parcela 3/10",            340,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,3,14, "Conta de luz",                        360,   "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,3,14, "Conta de água",                       92,    "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,3,15, "Internet fibra 400mb",                130,   "EXPENSE", "servicos",  "DEBIT_CARD");
  await tx(2026,3, 8, "Netflix",                             45,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,3, 8, "Spotify Family",                      22,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,3, 8, "Plano de saúde casal",               680,   "EXPENSE", "saude",     "BANK_TRANSFER");
  await tx(2026,3,10, "Flamenco Camila — mensalidade",      220,   "EXPENSE", "lazer",     "PIX");

  await tx(2026,3, 1, "Mercado Semanal",                     380,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,3, 8, "Mercado Semanal",                     360,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,3,15, "Mercado Semanal",                     375,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,3,22, "Mercado Semanal",                     365,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,3,29, "Mercado Semanal",                     350,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,3, 8, "Feira livre",                         82,    "EXPENSE", "alimentacao","CASH");
  await tx(2026,3,14, "iFood — fim de semana",               80,    "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2026,3,28, "Páscoa — ceia + ovos artesanais",     240,   "EXPENSE", "alimentacao","CREDIT_CARD");

  await tx(2026,3, 4, "Gasolina — Camila",                   308,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,3,18, "Gasolina — Camila",                   295,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,3,22, "Pedágio viagem Páscoa",               52,    "EXPENSE", "transporte","CASH");

  await tx(2026,3, 5, "Ração Royal Canin — Mingau, Pudim, Nico", 360,"EXPENSE","pets",     "CREDIT_CARD");
  await tx(2026,3, 5, "Ração Hills k/d — Pitoca",           145,   "EXPENSE", "pets",      "PIX");
  await tx(2026,3, 8, "Areia higiênica 2x",                 95,    "EXPENSE", "pets",      "PIX");
  await tx(2026,3, 9, "Consulta nefrologista — Pitoca",     350,   "EXPENSE", "petsaude",  "PIX", "Avaliação para diálise peritoneal");
  await tx(2026,3, 9, "Exames mensais Pitoca + ultrassom renal", 490,"EXPENSE","petsaude", "PIX");
  await tx(2026,3, 9, "Medicamentos Pitoca",                 560,   "EXPENSE", "petsaude",  "PIX");
  await tx(2026,3,15, "Antiparasitário — Mingau, Pudim, Nico, Pitoca", 180,"EXPENSE","pets","PIX","Frontline Combo");
  await tx(2026,3,28, "Hotel para gatos — feriado Páscoa",  320,   "EXPENSE", "pets",      "PIX", "Nico, Mingau e Pudim — Pitoca ficou em casa");

  await tx(2026,3, 8, "Velas, incensos — Leonardo & Camila", 155,  "EXPENSE", "religioso", "CASH");
  await tx(2026,3,22, "Viagem Páscoa — hospedagem",          680,   "EXPENSE", "lazer",     "CREDIT_CARD", "Pousada Pedregulho SP");
  await tx(2026,3, 8, "Academia — Leonardo",                 120,   "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,3,15, "Consulta médica — Camila (gineco)",   220,   "EXPENSE", "saude",     "PIX");
  await tx(2026,3, 5, "Livros técnicos + Kindle — Leonardo", 180,  "EXPENSE", "educacao",  "CREDIT_CARD");

  // ══════════════════════════════════════════════════════════════════════════
  // ABRIL 2026
  // Pitoca: internação mais grave, 4ª internação — colocação de cateter peritoneal
  // ══════════════════════════════════════════════════════════════════════════

  await tx(2026,4, 5, "Salário Leonardo — abril",            15000, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,4, 5, "Salário Camila — Hemocentro RP",       4800, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,4,20, "Aulas ETEC Serrana — Camila",         1100,  "INCOME", "rendaextra", "BANK_TRANSFER");
  await tx(2026,4,25, "Venda itens usados — OLX",            380,   "INCOME", "outras",     "PIX", "Eletrônicos e móveis");

  await tx(2026,4, 5, "Aluguel",                             2800,  "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,4, 5, "Condomínio",                          450,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,4, 5, "Pensão — filha",                      1700,  "EXPENSE", "pensao",    "BANK_TRANSFER");
  await tx(2026,4,12, "IPTU 2026 — parcela 4/10",            340,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,4,14, "Conta de luz",                        340,   "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,4,14, "Conta de água",                       90,    "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,4,15, "Internet fibra 400mb",                130,   "EXPENSE", "servicos",  "DEBIT_CARD");
  await tx(2026,4,18, "Reparos apartamento — torneira + box",420,   "EXPENSE", "moradia",   "PIX");
  await tx(2026,4, 8, "Netflix",                             45,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,4, 8, "Spotify Family",                      22,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,4, 8, "Plano de saúde casal",               680,   "EXPENSE", "saude",     "BANK_TRANSFER");
  await tx(2026,4,10, "Flamenco Camila — mensalidade",      220,   "EXPENSE", "lazer",     "PIX");

  await tx(2026,4, 5, "Mercado Semanal",                     375,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,4,12, "Mercado Semanal",                     358,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,4,19, "Mercado Semanal",                     370,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,4,26, "Mercado Semanal",                     345,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,4,12, "Feira livre",                         78,    "EXPENSE", "alimentacao","CASH");
  await tx(2026,4,18, "iFood — sábado",                      82,    "EXPENSE", "alimentacao","CREDIT_CARD");

  await tx(2026,4, 2, "Gasolina — Camila",                   302,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,4,16, "Gasolina — Camila",                   288,   "EXPENSE", "transporte","CREDIT_CARD");

  await tx(2026,4, 5, "Ração Royal Canin — Mingau, Pudim, Nico", 360,"EXPENSE","pets",     "CREDIT_CARD");
  await tx(2026,4, 5, "Ração Hills k/d — Pitoca",           145,   "EXPENSE", "pets",      "PIX");
  await tx(2026,4, 8, "Areia higiênica 2x",                 95,    "EXPENSE", "pets",      "PIX");
  // Crise severa — 4ª internação com cirurgia
  await tx(2026,4, 8, "Internação Pitoca (7 dias) — crise severa", 3200,"EXPENSE","petsaude","PIX","Piora aguda — necessidade de cateter peritoneal");
  await tx(2026,4, 9, "Cirurgia — colocação cateter peritoneal Pitoca", 1800,"EXPENSE","petsaude","PIX");
  await tx(2026,4,15, "Alta Pitoca — novo protocolo de diálise", 380,"EXPENSE","petsaude", "PIX");
  await tx(2026,4,15, "Medicamentos Pitoca — protocolo atualizado", 620,"EXPENSE","petsaude","PIX","EPO + fosfato + eritropoetina + soluções");
  await tx(2026,4,22, "Retorno Pitoca — avaliação cateter",  290,   "EXPENSE", "petsaude",  "PIX");
  await tx(2026,4,22, "Exames Pitoca pós-cirurgia",          380,   "EXPENSE", "petsaude",  "PIX");

  await tx(2026,4, 8, "Velas, incensos — Leonardo & Camila", 160,  "EXPENSE", "religioso", "CASH");
  await tx(2026,4,18, "Itens rituais e cristais",             95,   "EXPENSE", "religioso", "PIX");

  await tx(2026,4,26, "Aniversário Camila — restaurante",    340,   "EXPENSE", "lazer",     "CREDIT_CARD", "Jantar especial em RP");
  await tx(2026,4,26, "Presente aniversário Camila",         380,   "EXPENSE", "lazer",     "CREDIT_CARD", "Roupa de flamenco + acessórios");

  await tx(2026,4, 8, "Academia — Leonardo",                 120,   "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,4, 8, "Consulta médica — Leonardo (check-up)",250,  "EXPENSE", "saude",     "PIX");
  await tx(2026,4, 8, "Exames laboratoriais — Leonardo",     195,   "EXPENSE", "saude",     "PIX");
  await tx(2026,4,10, "Farmácia",                            82,    "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,4,20, "Roupas outono",                       260,   "EXPENSE", "vestuario", "CREDIT_CARD");

  // ══════════════════════════════════════════════════════════════════════════
  // MAIO 2026
  // Pitoca: 1ª semana de diálise em casa. Rotina pesada mas controlada.
  // ══════════════════════════════════════════════════════════════════════════

  await tx(2026,5, 5, "Salário Leonardo — maio",             15000, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,5, 5, "Salário Camila — Hemocentro RP",       4800, "INCOME", "salario",    "BANK_TRANSFER");
  await tx(2026,5,12, "Freela — Leonardo (app mobile)",      3500,  "INCOME", "rendaextra", "PIX", "Aplicativo delivery local");
  await tx(2026,5,20, "Aulas ETEC Serrana — Camila",         1100,  "INCOME", "rendaextra", "BANK_TRANSFER");

  await tx(2026,5, 5, "Aluguel",                             2800,  "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,5, 5, "Condomínio",                          450,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,5, 5, "Pensão — filha",                      1700,  "EXPENSE", "pensao",    "BANK_TRANSFER");
  await tx(2026,5,12, "IPTU 2026 — parcela 5/10",            340,   "EXPENSE", "moradia",   "BANK_TRANSFER");
  await tx(2026,5,14, "Conta de luz",                        325,   "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,5,14, "Conta de água",                       88,    "EXPENSE", "moradia",   "DEBIT_CARD");
  await tx(2026,5,15, "Internet fibra 400mb",                130,   "EXPENSE", "servicos",  "DEBIT_CARD");
  await tx(2026,5, 8, "Netflix",                             45,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,5, 8, "Spotify Family",                      22,    "EXPENSE", "servicos",  "CREDIT_CARD");
  await tx(2026,5, 8, "Plano de saúde casal",               680,   "EXPENSE", "saude",     "BANK_TRANSFER");
  await tx(2026,5,10, "Flamenco Camila — mensalidade",      220,   "EXPENSE", "lazer",     "PIX");

  await tx(2026,5, 3, "Mercado Semanal",                     368,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,5,10, "Mercado Semanal",                     352,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,5,17, "Mercado Semanal",                     375,   "EXPENSE", "alimentacao","DEBIT_CARD");
  await tx(2026,5,11, "Churrasco Dia das Mães — família",   250,   "EXPENSE", "alimentacao","CREDIT_CARD");
  await tx(2026,5,10, "Feira livre",                         75,    "EXPENSE", "alimentacao","CASH");
  await tx(2026,5,16, "iFood — sexta",                       85,    "EXPENSE", "alimentacao","CREDIT_CARD");

  await tx(2026,5, 2, "Gasolina — Camila",                   298,   "EXPENSE", "transporte","CREDIT_CARD");
  await tx(2026,5,16, "Gasolina — Camila",                   282,   "EXPENSE", "transporte","CREDIT_CARD");

  await tx(2026,5, 5, "Ração Royal Canin — Mingau, Pudim, Nico", 360,"EXPENSE","pets",     "CREDIT_CARD");
  await tx(2026,5, 5, "Ração Hills k/d — Pitoca",           145,   "EXPENSE", "pets",      "PIX");
  await tx(2026,5, 8, "Areia higiênica 2x",                 95,    "EXPENSE", "pets",      "PIX");
  // Diálise peritoneal domiciliar — custo mensal alto
  await tx(2026,5, 5, "Soluções para diálise peritoneal — Pitoca", 980,"EXPENSE","petsaude","PIX","Kit mensal de soluções dialíticas");
  await tx(2026,5, 9, "Consulta retorno nefrologista — Pitoca", 350,"EXPENSE","petsaude",  "PIX");
  await tx(2026,5, 9, "Exames mensais Pitoca",               290,   "EXPENSE", "petsaude",  "PIX");
  await tx(2026,5, 9, "Medicamentos Pitoca — protocolo diálise", 640,"EXPENSE","petsaude",  "PIX");
  await tx(2026,5,18, "Internação Pitoca (2 dias) — ajuste cateter", 920,"EXPENSE","petsaude","PIX","Obstrução parcial do cateter peritoneal");
  await tx(2026,5,20, "Material de curativo cateter — Pitoca", 120, "EXPENSE", "petsaude",  "PIX", "Consumível mensal para higiene do cateter");

  await tx(2026,5, 8, "Velas, incensos — Leonardo & Camila", 150,  "EXPENSE", "religioso", "CASH");
  await tx(2026,5,18, "Ritual de proteção — itens",          110,   "EXPENSE", "religioso", "PIX");

  await tx(2026,5,11, "Presente Dia das Mães — família",     220,   "EXPENSE", "lazer",     "PIX");
  await tx(2026,5,17, "Apresentação flamenco — figurino extra", 190,"EXPENSE", "lazer",     "PIX", "Recital semestral ETEC");
  await tx(2026,5,17, "Cinema + jantar pós-recital",         148,   "EXPENSE", "lazer",     "CREDIT_CARD");

  await tx(2026,5, 8, "Academia — Leonardo",                 120,   "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,5, 8, "Consulta psicóloga — Camila",        200,   "EXPENSE", "saude",     "PIX", "Apoio emocional — tratamento da Pitoca");
  await tx(2026,5,15, "Farmácia",                            68,    "EXPENSE", "saude",     "DEBIT_CARD");
  await tx(2026,5,20, "MBA Gestão — Camila parcela 1/12",   890,   "EXPENSE", "educacao",  "BANK_TRANSFER");

  console.log(`✅ Seed concluído! ${txCounter} transações em 6 meses.`);
  console.log(`   Usuário: ${seedEmail}`);
  console.log(`   Família: Leonardo Pontes & Camila Godinho`);
  console.log(`   Gatos: Mingau 🐱 Pudim 🐱 Pitoca 🏥 Nico 🐱`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
