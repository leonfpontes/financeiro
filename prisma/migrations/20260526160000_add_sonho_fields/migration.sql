-- AlterTable: add metaTotal and dataAlvo to compromissos (SONHO fields)
ALTER TABLE "compromissos" ADD COLUMN "metaTotal" DECIMAL(12,2);
ALTER TABLE "compromissos" ADD COLUMN "dataAlvo" DATE;
