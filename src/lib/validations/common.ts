import { z } from "zod";

/** Validates "YYYY-MM" month strings */
export const mesAnoString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Formato inválido (YYYY-MM)")
  .refine((value) => {
    const month = Number(value.slice(5, 7));
    return month >= 1 && month <= 12;
  }, "Mês inválido (use 01 a 12)");

/** Generic name field with configurable max length */
export const nomeField = (max = 255) => z.string().min(1).max(max);

/** Optional nullable notes field */
export const notasField = z.string().max(500).optional().nullable();

/** Positive monetary value */
export const valorPositivo = z.coerce.number().positive();
