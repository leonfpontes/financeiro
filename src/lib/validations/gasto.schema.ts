import { z } from "zod";
import { GastoTipo, PeriodoInput } from "@/generated/prisma";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)");

export const createGastoSchema = z.object({
  nome: z.string().min(1).max(255),
  tipo: z.nativeEnum(GastoTipo),
  valor: z.coerce.number().positive(),
  periodoInput: z.nativeEnum(PeriodoInput).optional().nullable(),
  mesesOcorrencia: z.array(z.number().int().min(1).max(12)).optional().default([]),
  dataInicio: dateString,
  dataFim: dateString.optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
  icone: z.string().max(50).optional().nullable(),
});

export const updateGastoSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  tipo: z.nativeEnum(GastoTipo).optional(),
  valor: z.coerce.number().positive().optional(),
  periodoInput: z.nativeEnum(PeriodoInput).optional().nullable(),
  mesesOcorrencia: z.array(z.number().int().min(1).max(12)).optional(),
  ativo: z.boolean().optional(),
  dataInicio: dateString.optional(),
  dataFim: dateString.optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
  icone: z.string().max(50).optional().nullable(),
});

export type CreateGastoInput = z.infer<typeof createGastoSchema>;
export type UpdateGastoInput = z.infer<typeof updateGastoSchema>;
