-- DropIndex
DROP INDEX "gastos_avulsos_cartao_cartaoId_mesAno_idx";

-- CreateTable
CREATE TABLE "faturas_pagamento" (
    "id" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mesAno" VARCHAR(7) NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturas_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faturas_pagamento_userId_idx" ON "faturas_pagamento"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_pagamento_cartaoId_mesAno_key" ON "faturas_pagamento"("cartaoId", "mesAno");

-- AddForeignKey
ALTER TABLE "faturas_pagamento" ADD CONSTRAINT "faturas_pagamento_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes_credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas_pagamento" ADD CONSTRAINT "faturas_pagamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
