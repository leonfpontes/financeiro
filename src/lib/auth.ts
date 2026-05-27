import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

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

          // Rate-limit por IP — máx. 10 tentativas / 15 min (in-memory; instância única)
          const ip =
            (req?.headers?.["x-forwarded-for"] as string | undefined)
              ?.split(",")[0]
              ?.trim() ?? "unknown";
          const { allowed } = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
          if (!allowed) {
            console.error("[Auth] Rate limit atingido para IP:", ip);
            return null;
          }

          const email = credentials.email.toLowerCase();
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
