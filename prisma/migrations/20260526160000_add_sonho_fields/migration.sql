-- AlterTable: add metaTotal and dataAlvo to compromissos (SONHO fields)
ALTER TABLE "compromissos" ADD COLUMN "meta_total" DECIMAL(12,2);
ALTER TABLE "compromissos" ADD COLUMN "data_alvo" DATE;
