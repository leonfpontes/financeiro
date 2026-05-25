-- AlterTable
ALTER TABLE "gastos" ADD COLUMN     "dataFim" DATE,
ADD COLUMN     "dataInicio" DATE NOT NULL DEFAULT CURRENT_DATE;
