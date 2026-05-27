import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fail } from "@/lib/api-response";

interface AuthSuccess {
  userId: string;
  error: null;
}

interface AuthFailure {
  userId: null;
  error: NextResponse;
}

/**
 * Extracts and validates the authenticated userId from the session.
 * Returns { userId, error: null } on success, or { userId: null, error: Response } on failure.
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if (auth.error) return auth.error;
 *   const { userId } = auth;
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json(fail("UNAUTHORIZED", "Não autorizado", 401), { status: 401 }),
    };
  }
  return { userId, error: null };
}
