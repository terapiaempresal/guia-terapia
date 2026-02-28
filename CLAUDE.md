# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
npm run test-db   # Test database connection
npm run show-sql  # Show SQL utilities
```

No test framework is configured (no Jest/Vitest).

## Architecture

This is a **B2B SaaS platform** for corporate team development ("Jornada de Equipe"). It uses Next.js 14 App Router with TypeScript, Tailwind CSS, PostgreSQL via Prisma + Supabase, and JWT authentication stored in localStorage.

### Multi-tenant model

```
Company → Managers (gestores) → Employees (funcionários) → Departments
```

Companies have a quota of employees and belong to a plan. Managers administer the company; employees are the end-users who consume training content (videos, workbooks, journey maps).

### Two separate user flows

- **Gestores (managers):** login at `/login`, authenticate via `POST /api/auth/login`, manage via `/gestor/*`
- **Funcionários (employees):** login at `/login/funcionario`, authenticate via `POST /api/employees/login`, access content at `/funcionario/*`

Both receive JWT tokens stored in localStorage. `middleware.ts` handles route protection, allowing public access only to `/`, `/login`, `/acesso`, `/cadastro-gestor`, `/login/esqueci-senha`, and `/login/redefinir-senha`.

### Key library files (`src/lib/`)

| File | Purpose |
|---|---|
| `auth.ts` | `User` interface, `auth` object, `useAuth` hook |
| `prisma.ts` | Prisma client singleton |
| `supabase.ts` | Supabase client init |
| `email.ts` | `EmailService` class via Nodemailer/SMTP |
| `feature-flags.ts` | Gates for payments, emails, webhooks |
| `password-utils.ts` | bcrypt hashing/verification |

### Feature flags (env vars)

- `FLAG_ENABLE_PAYMENTS` — Asaas payment integration (default: false)
- `FLAG_ENABLE_EMAILS` — transactional emails (default: true)
- `FLAG_ENABLE_WEBHOOKS` — webhook processing (default: false)

### Database

Prisma ORM with PostgreSQL (Supabase). Five core models: `Company`, `Manager`, `Employee`, `Department`, `Video`.

Use `DATABASE_URL` for pooled connections and `DIRECT_URL` for migrations. See `.env.example` for all required environment variables.

### AI chat

Google Gemini API (`GOOGLE_GENERATIVE_AI_API_KEY`) powers the chat feature in `/gestor/chat`.

### Path alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
