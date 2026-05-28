import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

          // Conta criada via Google não tem senha local
          if (!user.passwordHash) {
            console.error("[Auth] Conta Google-only sem senha local:", email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            console.error("[Auth] Senha inválida para:", email);
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
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email?.toLowerCase();
        if (!email) return false;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              name: profile?.name ?? email,
              email,
              passwordHash: null,
            },
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // Para Google, busca o userId real do banco pelo e-mail do perfil
        const email = token.email?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) token.userId = dbUser.id;
        }
        // token.picture é populado automaticamente pelo NextAuth com a foto do Google
      } else if (user) {
        // Credentials: user.id já é o id do banco
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      if (token.picture && session.user) {
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
};
