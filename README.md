# Financeiro

Aplicação web de **gestão financeira pessoal**. Fotografia mensal do orçamento, controle de entradas, gastos, compromissos e cartões de crédito, com dark mode e gráficos de evolução.

## Features

- **Fotografia Financeira** — Snapshot mensal com planejado vs. realizado
- **Entradas** — Fontes de renda fixas e variáveis
- **Gastos** — Despesas fixas, variáveis e sazonais
- **Compromissos** — Dívidas, investimentos e sonhos
- **Evolução** — Tendências multi-mensais com gráficos
- **Cartões de Crédito** — Assinaturas, parcelamentos e controle de fatura
- **Dark Mode** — Tema claro/escuro com persistência em localStorage

## Stack

Next.js 16 · React 19 · TypeScript 5 · MUI 9 · Tailwind 4 · Prisma 7 · PostgreSQL 16 · NextAuth 4 · Recharts 3

---

## Setup Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (ou Docker)

### 1. Clone e instale dependências

```bash
git clone https://github.com/leonfpontes/financeiro.git
cd financeiro
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/financeiro"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Opcional — para o script de seed
SEED_USER_EMAIL="seu@email.com"
SEED_USER_PASSWORD="SuaSenha@123"
```

### 3. Banco de dados

```bash
npm run db:migrate   # Criar tabelas
npm run db:seed      # Popular com dados de demo (opcional)
```

### 4. Iniciar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Deploy via Docker

```bash
# Configure o .env com os valores reais (veja seção acima)

# Build e inicialização
docker-compose up --build
```

Acesse [http://localhost:3002](http://localhost:3002)

O container executa `prisma migrate deploy` automaticamente no startup.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|------------|----------|
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ | Chave para assinar tokens JWT |
| `NEXTAUTH_URL` | ✅ | URL base da aplicação |
| `SEED_USER_EMAIL` | Para seed | Email do usuário demo |
| `SEED_USER_PASSWORD` | Para seed | Senha do usuário demo |

---

## Scripts

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção (inclui prisma generate)
npm run start        # Servidor de produção
npm run lint         # Verificar erros de lint

npm run db:generate  # Regenerar cliente Prisma
npm run db:migrate   # Criar/aplicar migrations
npm run db:seed      # Popular banco com dados de demo
npm run db:reset     # Resetar banco e reaplicar seed
```

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Login e Registro
│   ├── (dashboard)/     # Páginas autenticadas
│   └── api/             # API Routes (serverless)
├── components/          # Componentes React
├── lib/                 # Utilitários, temas, auth, validações
├── repositories/        # Camada de dados (Prisma)
├── services/            # Lógica de negócio
└── types/               # TypeScript types
```

---

## Contribuindo

Consulte [AGENTS.md](./AGENTS.md) para convenções de código, padrões arquiteturais e guias de contribuição.
