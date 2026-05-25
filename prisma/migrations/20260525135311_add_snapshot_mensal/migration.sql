-- CreateTable
CREATE TABLE "snapshot_mensal" (
    "id" TEXT NOT NULL,
    "mesAno" VARCHAR(7) NOT NULL,
    "entradas" DECIMAL(12,2) NOT NULL,
    "compromissos" DECIMAL(12,2) NOT NULL,
    "gastosFixos" DECIMAL(12,2) NOT NULL,
    "gastosVariaveis" DECIMAL(12,2) NOT NULL,
    "gastosSazonais" DECIMAL(12,2) NOT NULL,
    "margem" DECIMAL(12,2) NOT NULL,
    "margemPercent" DECIMAL(5,2) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshot_mensal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snapshot_mensal_userId_idx" ON "snapshot_mensal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "snapshot_mensal_userId_mesAno_key" ON "snapshot_mensal"("userId", "mesAno");

-- AddForeignKey
ALTER TABLE "snapshot_mensal" ADD CONSTRAINT "snapshot_mensal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
