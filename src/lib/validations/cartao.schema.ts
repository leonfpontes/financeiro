import { z } from "zod";

const mesAnoString = z.string().regex(/^\d{4}-\d{2}$/, "Formato inválido (YYYY-MM)");

export const createCartaoSchema = z.object({
  nome: z.string().min(1).max(100),
  limite: z.coerce.number().positive(),
  diaVencimento: z.coerce.number().int().min(1).max(31),
  cor: z.string().max(20).optional().nullable(),
  ativo: z.boolean().optional().default(true),
});

export const updateCartaoSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  limite: z.coerce.number().positive().optional(),
  diaVencimento: z.coerce.number().int().min(1).max(31).optional(),
  cor: z.string().max(20).optional().nullable(),
  ativo: z.boolean().optional(),
});

export const createAssinaturaSchema = z.object({
  nome: z.string().min(1).max(100),
  valor: z.coerce.number().positive(),
  dataInicio: mesAnoString,
  dataFim: mesAnoString.optional().nullable(),
  icone: z.string().max(50).optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
});

export const updateAssinaturaSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  valor: z.coerce.number().positive().optional(),
  dataInicio: mesAnoString.optional(),
  dataFim: mesAnoString.optional().nullable(),
  icone: z.string().max(50).optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
});

export const createParcelamentoSchema = z.object({
  nome: z.string().min(1).max(100),
  valorTotal: z.coerce.number().positive(),
  numeroParcelas: z.coerce.number().int().min(1).max(360),
  mesInicio: mesAnoString,
  icone: z.string().max(50).optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
});

export const updateParcelamentoSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  valorTotal: z.coerce.number().positive().optional(),
  numeroParcelas: z.coerce.number().int().min(1).max(360).optional(),
  mesInicio: mesAnoString.optional(),
  icone: z.string().max(50).optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
});

export const createGastoAvulsoSchema = z.object({
  nome: z.string().min(1).max(100),
  valor: z.coerce.number().positive(),
  mesAno: mesAnoString,
  icone: z.string().max(50).optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
});

export const updateGastoAvulsoSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  valor: z.coerce.number().positive().optional(),
  mesAno: mesAnoString.optional(),
  icone: z.string().max(50).optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
});

export type CreateCartaoInput = z.infer<typeof createCartaoSchema>;
export type UpdateCartaoInput = z.infer<typeof updateCartaoSchema>;
export type CreateAssinaturaInput = z.infer<typeof createAssinaturaSchema>;
export type UpdateAssinaturaInput = z.infer<typeof updateAssinaturaSchema>;
export type CreateParcelamentoInput = z.infer<typeof createParcelamentoSchema>;
export type UpdateParcelamentoInput = z.infer<typeof updateParcelamentoSchema>;
export type CreateGastoAvulsoInput = z.infer<typeof createGastoAvulsoSchema>;
export type UpdateGastoAvulsoInput = z.infer<typeof updateGastoAvulsoSchema>;
