import { z } from "zod";
import { CompromissoTipo } from "@/generated/prisma";

export const createCompromissoSchema = z.object({
  nome: z.string().min(1).max(255),
  tipo: z.nativeEnum(CompromissoTipo),
  valorMensal: z.coerce.number().positive(),
  notas: z.string().max(500).optional().nullable(),
});

export const updateCompromissoSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  tipo: z.nativeEnum(CompromissoTipo).optional(),
  valorMensal: z.coerce.number().positive().optional(),
  ativo: z.boolean().optional(),
  notas: z.string().max(500).optional().nullable(),
});

export type CreateCompromissoInput = z.infer<typeof createCompromissoSchema>;
export type UpdateCompromissoInput = z.infer<typeof updateCompromissoSchema>;
