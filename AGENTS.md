<!-- BEGIN:nextjs-agent-rules -->
# Financeiro — Guia para Agentes de IA

> **⚠️ Next.js 16.2.6** tem breaking changes em relação às versões anteriores. APIs, convenções e estrutura de arquivos podem diferir dos seus dados de treinamento. Antes de escrever código, leia o guia relevante em `node_modules/next/dist/docs/`. Respeite os avisos de depreciação.
<!-- END:nextjs-agent-rules -->

---

## 1. Visão Geral

Aplicação web de **gestão financeira pessoal** com:

| Módulo | Rota | Descrição |
|--------|------|----------|
| Fotografia | `/` | Snapshot mensal: planejado vs. realizado |
| Entradas | `/entradas` | Fontes de renda (fixas e variáveis) |
| Gastos | `/gastos` | Despesas por tipo (fixo, variável, sazonal) |
| Compromissos | `/compromissos` | Dívidas, investimentos e sonhos |
| Evolução | `/evolucao` | Tendências multi-mensais com gráficos |
| Cartões | `/cartoes` | Cartões de crédito: assinaturas, parcelamentos, fatura |
| Config | (embutido) | Margem %, teto de crédito, plano de ação |

---

## 2. Tech Stack

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js (App Router, Turbopack) | 16.2.6 |
| UI | React | 19.2.4 |
| Linguagem | TypeScript (strict) | 5 |
| Componentes | MUI (@mui/material) | 9.0.1 |
| CSS | Tailwind CSS | 4 |
| Banco de Dados | PostgreSQL | 16 |
| ORM | Prisma (driver adapter pg) | 7.8.0 |
| Autenticação | NextAuth (JWT, Credentials) | 4.24.14 |
| Gráficos | Recharts | 3.8.1 |
| Validação | Zod | 4.4.3 |
| Hash de senha | bcryptjs | 3.0.3 |
| Runtime | Node.js | 20 |

---

## 3. Arquitetura

### Camadas (de fora para dentro)

```
API Route (src/app/api/**/route.ts)
  └─ Valida entrada com Zod
  └─ Verifica sessão com getServerSession()
  └─ Chama Service
       └─ Aplica regras de negócio
            └─ Chama Repository
                 └─ Executa queries Prisma
```

**Regra:** Nunca pular camadas. API routes não chamam Prisma diretamente; Services não importam de API routes.

### Route Groups

- `(auth)` — páginas públicas: `/login`, `/register`
- `(dashboard)` — páginas protegidas pelo middleware NextAuth

---

## 4. Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/                  # Login, Registro
│   ├── (dashboard)/             # Todas as páginas autenticadas
│   │   ├── page.tsx             # Fotografia (rota raiz /)
│   │   ├── entradas/page.tsx
│   │   ├── gastos/page.tsx
│   │   ├── compromissos/page.tsx
│   │   ├── evolucao/page.tsx
│   │   ├── cartoes/page.tsx
│   │   └── cartoes/[id]/page.tsx
│   ├── api/                     # Handlers de API (serverless)
│   │   ├── auth/[...nextauth]/  # NextAuth
│   │   ├── auth/register/
│   │   ├── entradas/[id]/
│   │   ├── gastos/[id]/
│   │   ├── compromissos/[id]/
│   │   ├── cartoes/[id]/{fatura,pagamento,assinaturas,parcelamentos}
│   │   ├── config/
│   │   ├── fotografia/
│   │   ├── evolucao/{snapshots}
│   │   └── realizado/
│   ├── globals.css              # Vars CSS globais (light + dark)
│   └── layout.tsx               # Root layout (providers)
├── components/
│   ├── layout/                  # TopBar, Sidebar, BottomNav, ThemeToggle, Logo
│   ├── providers/               # ThemeContext.tsx, MuiProvider.tsx
│   ├── charts/                  # BalanceLineChart, MonthlyBarChart, CategoryPieChart
│   ├── cartoes/                 # CartaoCard, FaturaChart, ParcelamentoListItem
│   └── ui/                      # Componentes base reutilizáveis
├── generated/prisma/            # ⛔ GERADO AUTOMATICAMENTE — não editar
├── hooks/                       # React hooks reutilizáveis
│   ├── useDelete.ts             # Fluxo de confirmação de exclusão
│   ├── useFetch.ts              # Busca dados de API + loading + reload
│   ├── useIsDark.ts             # boolean para modo escuro
│   ├── useItemMenu.ts           # Ancora do menu MoreVert por item
│   └── useViewMode.ts           # Persiste modo lista/grid no localStorage
├── lib/
│   ├── api/
│   │   ├── parse-body.ts        # parseJsonBody<T>(req, schema) — valida Zod + JSON
│   │   └── require-auth.ts      # requireAuth() — extrai userId da sessão
│   ├── api-response.ts          # Helpers ok() e fail()
│   ├── auth.ts                  # Configuração NextAuth
│   ├── prisma.ts                # Singleton do cliente Prisma
│   ├── rate-limit.ts            # Rate limiter em memória (login)
│   ├── theme.ts                 # lightTheme e darkTheme do MUI
│   ├── utils/currency.ts        # formatBRL()
│   ├── utils/date.ts            # addMonths, subMonths, currentMesAno, formatMesAno, …
│   └── validations/             # Schemas Zod por modelo (common.ts com validadores base)
├── repositories/                # Queries Prisma (acesso a dados)
├── services/
│   ├── base.service.ts          # BaseCrudService<T,C,U> — CRUD genérico via DIP
│   └── …                        # Serviços concretos estendem BaseCrudService
└── types/
    ├── api.types.ts             # Types globais de API
    ├── crud.types.ts            # ICrudRepository + ICrudService (interfaces genéricas)
    └── next-auth.d.ts           # Extensão de tipos NextAuth
```

---

## 5. Padrões Obrigatórios

### 5.1 Resposta de API

Sempre use os helpers em `src/lib/api-response.ts`:

```ts
import { ok, fail } from "@/lib/api-response";

// Sucesso
return ok(data);                         // → { success: true, data }

// Erro
return fail("MENSAGEM", 400);            // → { error: { code, message } }
return fail("VALIDATION_ERROR", 400, details); // → { error: { ..., details } }
```

### 5.2 Autenticação em API Routes

Use o helper `requireAuth()` em vez de chamar `getServerSession` diretamente:

```ts
import { requireAuth } from "@/lib/api/require-auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { userId } = auth;
  // ...
}
```

**Toda route handler deve verificar a sessão.** Não existe rota autenticada sem essa checagem.

### 5.3 Validação com Zod

Use o helper `parseJsonBody()` em rotas POST/PATCH:

```ts
import { parseJsonBody } from "@/lib/api/parse-body";

const body = await parseJsonBody(req, createEntradaSchema);
if (body.error) return body.error;
const data = body.data; // tipado conforme o schema
```

### 5.4 Estrutura de um novo endpoint

```ts
// src/app/api/[modulo]/route.ts
import { NextResponse } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/api/require-auth";
import { parseJsonBody } from "@/lib/api/parse-body";
import { MinhaEntidadeService } from "@/services/minha-entidade.service";
import { createSchema } from "@/lib/validations/minha-entidade.schema";

const service = new MinhaEntidadeService();

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const data = await service.getAll(auth.userId);
  return NextResponse.json(ok(data));
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const body = await parseJsonBody(req, createSchema);
  if (body.error) return body.error;
  const result = await service.create(auth.userId, body.data);
  return NextResponse.json(ok(result), { status: 201 });
}
```

### 5.5 Serviços CRUD — BaseCrudService

Serviços que implementam CRUD padrão (getAll/getById/create/update/delete) devem estender `BaseCrudService`:

```ts
import { BaseCrudService } from "@/services/base.service";
import { EntradaRepository } from "@/repositories/entrada.repository";
import { Entrada } from "@/generated/prisma";
import { CreateEntradaInput, UpdateEntradaInput } from "@/lib/validations/entrada.schema";

export class EntradaService extends BaseCrudService<Entrada, CreateEntradaInput, UpdateEntradaInput> {
  constructor(repo: EntradaRepository = new EntradaRepository()) {
    super(repo);
  }
}
```

O repositório deve satisfazer `ICrudRepository<T, CreateInput, UpdateInput>` (tipagem estrutural — não é necessário `implements`).

### 5.6 Hooks React Reutilizáveis

| Hook | Arquivo | Uso |
|------|---------|-----|
| `useFetch<T>(url)` | `src/hooks/useFetch.ts` | Busca dados + `loading` + `reload()` |
| `useDelete(buildUrl, onSuccess)` | `src/hooks/useDelete.ts` | Fluxo de confirmação de exclusão |
| `useItemMenu<T>()` | `src/hooks/useItemMenu.ts` | Ancora do menu MoreVert por item |
| `useViewMode(resource)` | `src/hooks/useViewMode.ts` | Persiste modo lista/grid no localStorage |
| `useIsDark()` | `src/hooks/useIsDark.ts` | `boolean` para modo escuro (alternativa ao useTheme direto) |

### 5.7 Componentes UI Reutilizáveis

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `DeleteConfirmDialog` | `src/components/ui/DeleteConfirmDialog.tsx` | Diálogo de confirmação de exclusão |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Estado vazio com ícone + título + ação |
| `StatusChip` | `src/components/ui/StatusChip.tsx` | Badge de status com suporte a dark mode |

---

## 6. Dark Mode — Padrão Obrigatório

> **Qualquer componente que use cores de fundo ou borda baseadas em categoria deve seguir este padrão rigorosamente.**

### Regra Geral

```ts
// 1. Importar useTheme
import { useTheme } from "@mui/material/styles";

// 2. Declarar theme e isDark NO INÍCIO do componente,
//    ANTES de qualquer const que os consuma
const theme = useTheme();
const isDark = theme.palette.mode === "dark";

// 3. Usar na renderização
<Card sx={{ bgcolor: isDark ? cfg.darkBg : cfg.bg }} />
```

### Config Objects com Variantes Dark

```ts
const TIPO_CONFIG = {
  FIXA: {
    color: "#10b981",
    bg: "#f0fdf4",                        // light
    border: "#a7f3d0",
    darkBg: "rgba(16,185,129,0.10)",      // dark — 10% opacidade
    darkBorder: "rgba(16,185,129,0.22)",  // dark — 22% opacidade
  },
};
```

**Padrão de opacidades:**
- `darkBg` → `rgba(r, g, b, 0.10)` — fundo sutil
- `darkBorder` → `rgba(r, g, b, 0.22)` — borda visível

### Cores Proibidas sem verificação isDark

❌ `bgcolor: "#ecfdf5"` · `bgcolor: "#eef2ff"` · `bgcolor: "white"` · `bgcolor: "#f8fafc"`

✅ Substituir por: `bgcolor: isDark ? "rgba(r,g,b,0.10)" : "#ecfdf5"`

### Cores de Tema Seguras (qualquer modo)

✅ `bgcolor: "background.default"` · `bgcolor: "background.paper"` · `color: "text.secondary"` · `borderColor: "divider"`

---

## 7. Banco de Dados

### Modelos Principais

| Modelo | Campos Chave |
|--------|--------------|
| `User` | id, name, email, passwordHash, timeZone |
| `Entrada` | id, nome, tipo (FIXA\|VARIAVEL), valor, ativo, notas, userId |
| `Gasto` | id, nome, tipo (FIXO\|VARIAVEL\|SAZONAL), valor, periodoInput, mesesOcorrencia[], dataInicio, dataFim, icone, ativo, notas, userId |
| `Compromisso` | id, nome, tipo (DIVIDA\|INVESTIMENTO\|SONHO), valorMensal, ativo, notas, userId |
| `ConfigUsuario` | id, margemPercent (15), tetoCreditCard, notasPlanoAcao, userId |
| `RealizadoMensal` | id, mesAno (YYYY-MM), grupo, valorRealizado, userId |
| `SnapshotMensal` | id, mesAno, entradas, compromissos, gastosFixos, ..., userId |
| `CartaoCredito` | id, nome, limite, diaVencimento, cor, ativo, userId |
| `Assinatura` | id, nome, valor, dataInicio, dataFim, cartaoId, userId |
| `Parcelamento` | id, nome, valorTotal, numeroParcelas, mesInicio, cartaoId, userId |
| `GastoAvulsoCartao` | id, nome, valor, mesAno, cartaoId, userId |
| `FaturaPagamento` | id, mesAno, pago, dataPagamento, cartaoId, userId |

**Valores monetários:** `Decimal(12, 2)` no Prisma. Use `parseFloat(String(item.valor))` na UI; use `new Prisma.Decimal(value)` em writes no repository.

---

## 8. API Routes

| Método | Rota | Descrição |
|--------|------|----------|
| GET/POST | `/api/entradas` | Listar / criar entrada |
| GET/PUT/DELETE | `/api/entradas/[id]` | Detalhe / atualizar / remover entrada |
| GET/POST | `/api/gastos` | Listar / criar gasto |
| GET/PUT/DELETE | `/api/gastos/[id]` | Detalhe / atualizar / remover gasto |
| GET/POST | `/api/compromissos` | Listar / criar compromisso |
| GET/PUT/DELETE | `/api/compromissos/[id]` | Detalhe / atualizar / remover compromisso |
| GET/POST | `/api/cartoes` | Listar cartões (com fatura atual) / criar |
| GET/PUT/DELETE | `/api/cartoes/[id]` | Detalhe / atualizar / remover cartão |
| GET | `/api/cartoes/[id]/fatura` | Fatura do cartão por mês (`?mesAno=YYYY-MM`) |
| PUT | `/api/cartoes/[id]/pagamento` | Marcar fatura como paga |
| GET/POST | `/api/cartoes/[id]/assinaturas` | Listar / criar assinatura no cartão |
| GET/POST | `/api/cartoes/[id]/parcelamentos` | Listar / criar parcelamento no cartão |
| GET/PATCH | `/api/config` | Ler / atualizar config do usuário |
| GET | `/api/fotografia` | Snapshot mensal completo (`?mesAno=YYYY-MM`) |
| GET | `/api/evolucao` | Tendências multi-mensais |
| GET | `/api/evolucao/snapshots` | Histórico de snapshots |
| POST | `/api/realizado` | Salvar valor realizado por categoria/mês |
| POST | `/api/auth/register` | Registro de novo usuário |
| GET/POST | `/api/auth/[...nextauth]` | Handler NextAuth |

---

## 9. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|------------|----------|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | ✅ | String aleatória para assinar JWT |
| `NEXTAUTH_URL` | ✅ | URL base da aplicação (`http://localhost:3002`) |
| `SEED_USER_EMAIL` | Para seed | Email do usuário demo |
| `SEED_USER_PASSWORD` | Para seed | Senha do usuário demo |

---

## 10. Comandos

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # prisma generate + next build
npm run start        # Servidor de produção
npm run lint         # Verificar erros de lint

npm run db:generate  # Regenerar cliente Prisma
npm run db:migrate   # Criar/aplicar migrations
npm run db:seed      # Popular banco com dados de demo
npm run db:reset     # Resetar banco e reaplicar seed

# Docker
docker-compose up --build  # Build + subir app + postgres
docker-compose up          # Usar imagem já construída
```

**Acesso Docker:** `http://localhost:3002` (porta 3000 interna mapeada para 3002).

---

## 11. Armadilhas Conhecidas

- **`src/generated/prisma` não está no git** — gerado em build por `prisma generate && next build`. Nunca commitar esse diretório.

- **`prisma generate` está no build script, não como `postinstall`** — intencional para evitar falha no Docker quando `postinstall` roda antes de `COPY . .`.

- **Aviso de depreciação de middleware** (`"middleware" file convention is deprecated`) é esperado e não quebra o build.

- **`isDark` deve ser declarado antes de qualquer `const` que o use** — hoisting não se aplica a `const`. Se `tabBgs = isDark ? ...` aparecer antes de `const isDark = ...`, o TypeScript lança "used before its declaration".

- **Valores `Decimal` do Prisma** não são `number` nativos. Use `parseFloat(String(valor))` para UI; `new Prisma.Decimal(value)` para writes.

- **`suppressHydrationWarning`** no `<html>` do layout root é intencional — o tema é lido do localStorage no cliente após a hidratação.
