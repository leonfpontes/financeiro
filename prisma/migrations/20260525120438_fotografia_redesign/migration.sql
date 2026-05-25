-- CreateEnum
CREATE TYPE "EntradaTipo" AS ENUM ('FIXA', 'VARIAVEL');

-- CreateEnum
CREATE TYPE "GastoTipo" AS ENUM ('FIXO', 'VARIAVEL', 'SAZONAL');

-- CreateEnum
CREATE TYPE "PeriodoInput" AS ENUM ('SEMANAL', 'MENSAL');

-- CreateEnum
CREATE TYPE "CompromissoTipo" AS ENUM ('DIVIDA', 'INVESTIMENTO', 'SONHO');

-- CreateEnum
CREATE TYPE "GrupoRealizado" AS ENUM ('ENTRADAS', 'GASTOS_FIXOS', 'GASTOS_VARIAVEIS', 'GASTOS_SAZONAIS', 'COMPROMISSOS');

-- CreateTable
CREATE TABLE "entradas" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "EntradaTipo" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "notas" VARCHAR(500),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "GastoTipo" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "periodoInput" "PeriodoInput",
    "mesesOcorrencia" INTEGER[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "notas" VARCHAR(500),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compromissos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "CompromissoTipo" NOT NULL,
    "valorMensal" DECIMAL(12,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "notas" VARCHAR(500),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compromissos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_usuario" (
    "id" TEXT NOT NULL,
    "margemPercent" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "tetoCreditCard" DECIMAL(12,2),
    "notasPlanoAcao" VARCHAR(2000),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realizado_mensal" (
    "id" TEXT NOT NULL,
    "mesAno" VARCHAR(7) NOT NULL,
    "grupo" "GrupoRealizado" NOT NULL,
    "valorRealizado" DECIMAL(12,2) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "realizado_mensal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entradas_userId_idx" ON "entradas"("userId");

-- CreateIndex
CREATE INDEX "gastos_userId_idx" ON "gastos"("userId");

-- CreateIndex
CREATE INDEX "compromissos_userId_idx" ON "compromissos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "config_usuario_userId_key" ON "config_usuario"("userId");

-- CreateIndex
CREATE INDEX "realizado_mensal_userId_mesAno_idx" ON "realizado_mensal"("userId", "mesAno");

-- CreateIndex
CREATE UNIQUE INDEX "realizado_mensal_userId_mesAno_grupo_key" ON "realizado_mensal"("userId", "mesAno", "grupo");

-- AddForeignKey
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_usuario" ADD CONSTRAINT "config_usuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "realizado_mensal" ADD CONSTRAINT "realizado_mensal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
