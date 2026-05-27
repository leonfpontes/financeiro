import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIpFromHeaders(headers: Record<string, string | string[] | undefined> | undefined): string {
  if (!headers) return "unknown";

  const pickFirst = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const forwarded = pickFirst(headers["x-forwarded-for"])?.split(",")[0]?.trim();
  const realIp = pickFirst(headers["x-real-ip"])?.trim();

  return forwarded || realIp || "unknown";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // No NextAuth v4 o host confiável é controlado pela variável NEXTAUTH_URL no .env
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const email = credentials.email.trim().toLowerCase();

          // Rate-limit por IP — máx. 10 tentativas / 15 min (in-memory; instância única)
          const ip = getClientIpFromHeaders(req?.headers);
          const rateLimitKey = ip === "unknown" ? `login:email:${email}` : `login:ip:${ip}`;
          const { allowed } = checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);
          if (!allowed) {
            console.error("[Auth] Rate limit atingido para chave:", rateLimitKey);
            return null;
          }

          const user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            console.error("[Auth] Usuário não encontrado:", email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            console.error("[Auth] Senha inválida para:", email, "| hash length:", user.passwordHash.length);
            return null;
          }

          return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
          console.error("[Auth] Erro inesperado em authorize:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
};
