import { z } from "zod";
import { GrupoRealizado } from "@/generated/prisma";

export const updateConfigSchema = z.object({
  margemPercent: z.coerce.number().min(0).max(100).optional(),
  tetoCreditCard: z.coerce.number().positive().optional().nullable(),
  notasPlanoAcao: z.string().max(2000).optional().nullable(),
});

export const upsertRealizadoSchema = z.object({
  mesAno: z.string().regex(/^\d{4}-\d{2}$/),
  grupo: z.nativeEnum(GrupoRealizado),
  valorRealizado: z.coerce.number().min(0),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type UpsertRealizadoInput = z.infer<typeof upsertRealizadoSchema>;
