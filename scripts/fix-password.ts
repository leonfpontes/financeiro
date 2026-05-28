/**
 * Script one-off: corrige o passwordHash de um usuário específico.
 * Uso: EMAIL=user@example.com PASSWORD=Senha@123 npx tsx scripts/fix-password.ts
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const email    = process.env.EMAIL;
const password = process.env.PASSWORD;

if (!email || !password) {
  console.error("❌  Defina as variáveis EMAIL e PASSWORD antes de executar.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌  Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password!, 12);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  console.log(`✅  Hash atualizado com sucesso para: ${email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
