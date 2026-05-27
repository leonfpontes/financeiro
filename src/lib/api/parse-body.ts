import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { fail } from "@/lib/api-response";

interface ParseSuccess<T> {
  data: T;
  error: null;
}

interface ParseFailure {
  data: null;
  error: NextResponse;
}

/**
 * Parses and validates the JSON body of a request against a Zod schema.
 * Returns { data, error: null } on success, or { data: null, error: Response } on failure.
 *
 * Usage:
 *   const body = await parseJsonBody(req, createSchema);
 *   if (body.error) return body.error;
 *   const { data } = body;
 */
export async function parseJsonBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<ParseSuccess<T> | ParseFailure> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      data: null,
      error: NextResponse.json(fail("VALIDATION", "Payload JSON inválido", 400), { status: 400 }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: NextResponse.json(
        fail("VALIDATION", "Dados inválidos", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 },
      ),
    };
  }

  return { data: parsed.data, error: null };
}
