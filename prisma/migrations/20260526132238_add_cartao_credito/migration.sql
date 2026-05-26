-- CreateTable
CREATE TABLE "cartoes_credito" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "limite" DECIMAL(12,2) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "cor" VARCHAR(20),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartoes_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "dataInicio" VARCHAR(7) NOT NULL,
    "dataFim" VARCHAR(7),
    "icone" VARCHAR(50),
    "notas" VARCHAR(500),
    "cartaoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelamentos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "mesInicio" VARCHAR(7) NOT NULL,
    "icone" VARCHAR(50),
    "notas" VARCHAR(500),
    "cartaoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcelamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_avulsos_cartao" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "mesAno" VARCHAR(7) NOT NULL,
    "icone" VARCHAR(50),
    "notas" VARCHAR(500),
    "cartaoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_avulsos_cartao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cartoes_credito_userId_idx" ON "cartoes_credito"("userId");

-- CreateIndex
CREATE INDEX "assinaturas_cartaoId_idx" ON "assinaturas"("cartaoId");

-- CreateIndex
CREATE INDEX "assinaturas_userId_idx" ON "assinaturas"("userId");

-- CreateIndex
CREATE INDEX "parcelamentos_cartaoId_idx" ON "parcelamentos"("cartaoId");

-- CreateIndex
CREATE INDEX "parcelamentos_userId_idx" ON "parcelamentos"("userId");

-- CreateIndex
CREATE INDEX "gastos_avulsos_cartao_cartaoId_mesAno_idx" ON "gastos_avulsos_cartao"("cartaoId", "mesAno");

-- CreateIndex
CREATE INDEX "gastos_avulsos_cartao_userId_idx" ON "gastos_avulsos_cartao"("userId");

-- AddForeignKey
ALTER TABLE "cartoes_credito" ADD CONSTRAINT "cartoes_credito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelamentos" ADD CONSTRAINT "parcelamentos_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelamentos" ADD CONSTRAINT "parcelamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_avulsos_cartao" ADD CONSTRAINT "gastos_avulsos_cartao_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_avulsos_cartao" ADD CONSTRAINT "gastos_avulsos_cartao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
