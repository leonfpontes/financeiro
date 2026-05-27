-- AlterTable: add metaTotal and dataAlvo to compromissos (SONHO fields)
ALTER TABLE "compromissos" ADD COLUMN IF NOT EXISTS "metaTotal" DECIMAL(12,2);
ALTER TABLE "compromissos" ADD COLUMN IF NOT EXISTS "dataAlvo" DATE;
