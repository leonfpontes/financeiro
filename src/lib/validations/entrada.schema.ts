import { z } from "zod";
import { EntradaTipo } from "@/generated/prisma";

export const createEntradaSchema = z.object({
  nome: z.string().min(1).max(255),
  tipo: z.nativeEnum(EntradaTipo),
  valor: z.coerce.number().positive(),
  notas: z.string().max(500).optional().nullable(),
});

export const updateEntradaSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  tipo: z.nativeEnum(EntradaTipo).optional(),
  valor: z.coerce.number().positive().optional(),
  ativo: z.boolean().optional(),
  notas: z.string().max(500).optional().nullable(),
});

export type CreateEntradaInput = z.infer<typeof createEntradaSchema>;
export type UpdateEntradaInput = z.infer<typeof updateEntradaSchema>;
