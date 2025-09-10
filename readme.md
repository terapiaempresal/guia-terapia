# Guia de Terapia - MVP Web

Este é o MVP da plataforma Guia de Terapia, desenvolvida em Next.js 14 com Supabase, focada em desenvolvimento de equipes e liderança.

## ✨ Funcionalidades

### 🏢 Jornada de Equipe

- **Checkout direto** via Asaas (R$18/funcionário, mínimo 5)
- **Painel do Gestor** com métricas e gestão de funcionários
- **Área do Funcionário** com Mapa de Clareza, Guia de Ferramentas e Vídeos
- **Sistema de login automático** via JWT para funcionários

### 👤 Jornada do Líder

- **Coleta de leads** com redirecionamento para Hotmart
- **Integração simples** com checkout externo

### 📊 Recursos Principais

- **Mapa de Clareza**: perfil personalizado por CPF
- **Guia de Ferramentas**: editor colaborativo com auto-save
- **Módulos de Vídeo**: YouTube integrado com progresso
- **Relatórios em tempo real** para gestores

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + RLS
- **Pagamentos**: Asaas (sandbox/produção)
- **E-mail**: SMTP/Resend (configurável)

## 🚀 Configuração Rápida

### 1. Clone e instale dependências

```bash
git clone <repository-url>
cd guia-terapia
npm install
```

### 2. Configure as variáveis de ambiente

Copie `.env.local` e preencha com suas credenciais:

```bash
cp .env.local .env.local.example
```

**Variáveis obrigatórias para desenvolvimento:**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

### 3. Configure o banco de dados

Execute o script SQL em `database/schema.sql` no Supabase SQL Editor:

```sql
-- Copie e execute todo o conteúdo de database/schema.sql
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🎛️ Feature Flags

O sistema vem com todas as integrações **DESABILITADAS** por padrão:

```env
FLAG_ENABLE_PAYMENTS="false"    # Habilita pagamentos Asaas
FLAG_ENABLE_EMAILS="false"      # Habilita envio de e-mails
FLAG_ENABLE_WEBHOOKS="false"    # Habilita webhooks
```

### 🧪 Modo Desenvolvimento

- **Pagamentos**: Mock de checkout para testes
- **E-mails**: Logs no console
- **Webhooks**: Retorna 501 (não implementado)

### 🔥 Modo Produção
Defina as flags como `"true"` e configure:

**Asaas (Pagamentos):**

```env
ASAAS_API_KEY=your_api_key
ASAAS_WEBHOOK_SECRET=your_webhook_secret
ASAAS_ENV=production  # ou sandbox
```

**E-mail:**

```env
EMAIL_FROM=no-reply@seudominio.com
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── checkout/      # Asaas checkout
│   │   ├── webhooks/      # Webhooks handlers
│   │   └── videos/        # Vídeos e progresso
│   ├── checkout/          # Páginas de checkout
│   ├── funcionario/       # Área do funcionário
│   ├── gestor/            # Painel do gestor
│   └── layout.tsx         # Layout principal
├── lib/                   # Utilitários
│   ├── supabase.ts       # Cliente Supabase
│   ├── utils.ts          # JWT, validações
│   └── feature-flags.ts  # Controle de features
└── types/                 # TypeScript types
```

## 🔐 Segurança

### Row Level Security (RLS)

- **Managers**: acessam apenas dados da própria empresa
- **Funcionários**: acessam apenas seus próprios dados
- **Service Role**: operações administrativas (webhooks, criação de contas)

### Validações

- **CPF**: checksum completo
- **JWT**: tokens de 24h para login-links
- **Webhooks**: verificação de assinatura Asaas

## 🌐 Rotas Principais

### Públicas

- `/` - Homepage com seleção de jornadas
- `/checkout` - Checkout de equipe/líder
- `/checkout/sucesso` - Confirmação de pagamento

### Funcionário (autenticado)

- `/funcionario` - Dashboard principal
- `/funcionario/mapa` - Mapa de Clareza
- `/funcionario/ferramentas` - Editor de ferramentas
- `/funcionario/videos` - Módulos de vídeo

### Gestor (autenticado)

- `/gestor` - Painel gerencial
- Relatórios e gestão de funcionários

### API

- `POST /api/checkout/asaas/create` - Criar pagamento
- `POST /api/webhooks/asaas` - Webhook de pagamento
- `GET /api/videos` - Listar vídeos
- `POST /api/videos/progress` - Atualizar progresso

## 📊 Modelo de Dados

### Principais Entidades

- **Companies**: empresas clientes
- **Managers**: gestores das empresas
- **Orders**: pedidos e pagamentos
- **Employees**: funcionários
- **Videos**: conteúdo de vídeo
- **VideoProgress**: progresso dos funcionários
- **ClarityMapResults**: resultados do mapa por CPF
- **EmployeeDocuments**: documentos/anotações

## 🔄 Fluxos de Negócio

### 1. Checkout Equipe

1. Gestor preenche formulário → cria pagamento Asaas
2. Pagamento aprovado → webhook cria empresa e envia convites
3. Funcionários acessam via link JWT → completam cadastro
4. Gestor acompanha progresso no painel

### 2. Jornada Líder

1. Lead preenche nome/e-mail → redirecionamento Hotmart
2. (Opcional) Tracking no banco para métricas

## 🚧 Próximos Passos

### Integração Completa

1. **Configurar credenciais** Supabase, Asaas, SMTP
2. **Ativar feature flags** conforme necessário
3. **Implementar autenticação** Supabase Auth
4. **Configurar domínio** e SSL em produção

### Melhorias Futuras

- Dashboard analytics avançado
- Export de relatórios (PDF/Excel)
- Notificações push
- Chat/suporte integrado
- Mobile app (React Native)

## 🆘 Suporte

### Logs e Debug

- **Feature flags**: verificar arquivo `.env.local`
- **Supabase**: SQL Editor para debugging
- **API**: logs no console do navegador
- **Webhooks**: tabela `webhook_logs` no banco

### Troubleshooting Comum

1. **Erro 501**: feature flag desabilitada
2. **Erro auth**: verificar RLS policies
3. **Vídeos não carregam**: verificar YouTube IDs
4. **CPF inválido**: validação checksum ativa

---

**Desenvolvido para desenvolvimento ágil de equipes e liderança** 🚀

## 📋 Configuração das Variáveis de Ambiente

### **Supabase**

* `SUPABASE_URL`:
* `SUPABASE_ANON_KEY`:
* `SUPABASE_SERVICE_ROLE`:

**Asaas (pagamentos da “Jornada de Equipe” – checkout direto)**

* `ASAAS_API_KEY`:
* `ASAAS_WEBHOOK_SECRET` (assinatura para validar webhooks):
* `ASAAS_CHECKOUT_RETURN_URL` (ex.: `https://app.seudominio.com/checkout/sucesso`):
* `ASAAS_ENV` (`sandbox` | `production`):

**Hotmart (redirecionamento da “Jornada do Líder”)**

* `HOTMART_CHECKOUT_URL` (link do produto/módulo):
* (Opcional) `HOTMART_RETURN_URL`:

**App / Domínios**

* `APP_URL` (ex.: `https://app.seudominio.com`):
* `CDN_URL` (se usar):

**E-mail (envio transacional ao gestor)**

* Provedor (ex.: SMTP / Resend / AWS SES):
* `EMAIL_FROM` (ex.: `no-reply@seudominio.com`):
* (Se SMTP) `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`:

**Segurança**

* `JWT_SECRET` (para login-link de funcionário):
* `ENCRYPTION_KEY` (opcional, 32 chars, para criptografar dados sensíveis em repouso, ex.: whatsapp):

**Feature flags (ficarão `false` por padrão)**

* `FLAG_ENABLE_PAYMENTS` (default: `false`)
* `FLAG_ENABLE_EMAILS` (default: `false`)
* `FLAG_ENABLE_WEBHOOKS` (default: `false`)

Quando você me responder com isso (mesmo que seja “definir depois”), eu já te devolvo o **prompt-mãe final** com os placeholders preenchidos.

Enquanto isso, já te entrego **o esqueleto completo** (com tudo desativado por padrão) para você revisar e, se quiser, já começar a montar o repositório.

---

# PROMPT-MÃE (MVP Web) — arquitetura, SQL, fluxos e endpoints

Use este prompt como briefing para um dev/IA gerar o projeto. **Todas as integrações vêm desativadas** por flags e **todas as chaves estão como placeholders**.

## Objetivo do MVP

Aplicação web com:

1. **Checkout direto** da **Jornada de Equipe** via Asaas (R\$18/funcionário, mínimo 5).
2. **Jornada do Líder**: apenas coleta **nome + e-mail** e **redireciona para Hotmart**.
3. **Vincular empresa ao pedido** e **gerar link de login automático** para cada funcionário usando o **número do pedido**.
4. **Painel do Gestor**:

   * ver **% de funcionários cadastrados**;
   * **status do Mapa de Clareza** (Não iniciado / Em andamento / Concluído);
   * **progresso dos vídeos** (ex.: 3/6);
   * **CRUD de funcionários** (adicionar/editar) + **reenviar instruções de acesso**.
5. **Área do Funcionário**: primeiro acesso pede **Nome, CPF, Data de Nascimento, E-mail, WhatsApp** e vincula à empresa; pode **preencher Mapa** (resultado já vem do banco por CPF) e **marcar vídeos como assistidos**.
6. **Guia de Ferramentas**: editor tipo “Google Docs-light” com **auto-save**.
7. **Módulo de Vídeos**: lista vídeos (YouTube) + “**Marcar como assistido**”.
8. **Relatórios somente em tabela** (sem export).

## Stack sugerida

* **Frontend**: Next.js 14 (App Router), React, Tailwind.
* **Auth**: Supabase Auth (e RLS no Postgres).
* **DB**: Supabase (Postgres).
* **Jobs/Webhooks**: Next API Routes / Edge Functions (se quiser).
* **E-mail**: provedor SMTP ou Resend/SES (feature flag).
* **Pagamentos**: Asaas (feature flag).
* **Hotmart**: redirecionamento puro (sem API).

## Variáveis de ambiente (placeholders)

```
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE=""

ASAAS_API_KEY=""
ASAAS_WEBHOOK_SECRET=""
ASAAS_CHECKOUT_RETURN_URL=""
ASAAS_ENV="sandbox"

HOTMART_CHECKOUT_URL=""
HOTMART_RETURN_URL=""

APP_URL="http://localhost:3000"
CDN_URL=""

EMAIL_FROM=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

JWT_SECRET=""
ENCRYPTION_KEY=""

FLAG_ENABLE_PAYMENTS="false"
FLAG_ENABLE_EMAILS="false"
FLAG_ENABLE_WEBHOOKS="false"
```

> **Nota**: com `FLAG_* = false`, nenhum pagamento, webhook ou e-mail é efetivamente disparado; as rotas retornam mocks/“not implemented”.

---

## Modelo de dados (SQL Supabase)

> Rode em **SQL Editor** do Supabase. Em seguida, aplique as **RLS policies** logo abaixo.

```sql
-- SCHEMA
create schema if not exists app;

-- COMPANIES & USERS
create table if not exists app.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  employees_quota int not null check (employees_quota >= 5),
  plan text not null default 'equipe', -- 'equipe' | 'lider'
  status text not null default 'inactive' -- 'inactive' | 'active'
);

create table if not exists app.managers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references app.companies(id) on delete cascade,
  full_name text not null,
  email citext not null unique,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists app.orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'asaas',
  provider_order_id text, -- id/número do pedido no Asaas
  company_id uuid not null references app.companies(id) on delete cascade,
  quantity int not null check (quantity >= 5),
  unit_price_cents int not null default 1800,
  currency text not null default 'BRL',
  amount_cents int generated always as (quantity * unit_price_cents) stored,
  status text not null default 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Funcionários
create table if not exists app.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references app.companies(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null, -- definido após primeiro login
  full_name text,
  cpf text unique, -- validar formato na aplicação; índice único para lookup do mapa
  birth_date date,
  email citext,
  whatsapp text,
  created_at timestamptz not null default now(),
  status text not null default 'invited' -- 'invited' | 'active' | 'blocked'
);

create index if not exists employees_company_idx on app.employees(company_id);

-- Login Links para Funcionários (vinculados ao pedido)
create table if not exists app.employee_login_links (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references app.companies(id) on delete cascade,
  employee_id uuid references app.employees(id) on delete cascade,
  order_id uuid references app.orders(id) on delete cascade,
  token text not null, -- JWT curto/assinado
  expires_at timestamptz not null,
  used_at timestamptz
);

-- Mapa de Clareza (resultado vindo de Typeform/outro, chave por CPF)
create table if not exists app.clarity_map_results (
  id uuid primary key default gen_random_uuid(),
  cpf text not null unique,
  result_json jsonb not null,
  updated_at timestamptz not null default now()
);

-- Editor “Google Docs light” (auto-save)
create table if not exists app.employee_documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references app.employees(id) on delete cascade,
  title text not null default 'Caderno de Clareza e Ferramentas',
  content_json jsonb not null default '{}'::jsonb, -- armazenar como JSON (ex.: tiptap/plate)
  updated_at timestamptz not null default now()
);

-- Vídeos (YouTube)
create table if not exists app.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_id text not null,
  position int not null, -- ordenação
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Progresso de vídeos
create table if not exists app.video_progress (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references app.employees(id) on delete cascade,
  video_id uuid not null references app.videos(id) on delete cascade,
  watched boolean not null default false,
  watched_at timestamptz,
  unique (employee_id, video_id)
);

-- Métricas do Mapa por funcionário (status)
create table if not exists app.clarity_map_status (
  employee_id uuid primary key references app.employees(id) on delete cascade,
  status text not null default 'not_started', -- 'not_started' | 'in_progress' | 'done'
  updated_at timestamptz not null default now()
);

-- Auditoria básica de webhooks
create table if not exists app.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null, -- 'asaas'
  event_type text,
  payload jsonb not null,
  signature text,
  received_at timestamptz not null default now(),
  handled boolean not null default false,
  handled_at timestamptz
);
```

### RLS (Row-Level Security) — regras mínimas

```sql
alter table app.companies enable row level security;
alter table app.managers enable row level security;
alter table app.orders enable row level security;
alter table app.employees enable row level security;
alter table app.employee_login_links enable row level security;
alter table app.clarity_map_results enable row level security;
alter table app.employee_documents enable row level security;
alter table app.videos enable row level security;
alter table app.video_progress enable row level security;
alter table app.clarity_map_status enable row level security;
alter table app.webhook_logs enable row level security;

-- Helpers: função para obter company_id do manager/employee logado
create or replace function app.current_user_company_ids()
returns setof uuid
language sql stable as $$
  select company_id from app.managers where auth_user_id = auth.uid()
  union
  select company_id from app.employees where auth_user_id = auth.uid();
$$;

-- COMPANIES / MANAGERS: apenas managers da empresa
create policy "mgr_read_company" on app.companies
for select using (id in (select * from app.current_user_company_ids()));

create policy "mgr_read_self" on app.managers
for select using (auth_user_id = auth.uid());

-- ORDERS: visíveis aos managers da empresa
create policy "mgr_read_orders" on app.orders
for select using (company_id in (select * from app.current_user_company_ids()));

-- EMPLOYEES: visíveis aos managers da empresa e ao próprio funcionário
create policy "mgr_emp_select" on app.employees
for select using (
  company_id in (select * from app.current_user_company_ids())
  or auth_user_id = auth.uid()
);

create policy "mgr_emp_update" on app.employees
for update using (company_id in (select * from app.current_user_company_ids()));

-- DOCUMENTS: funcionário vê/edita o seu; manager só leitura agregada (via views ou endpoints)
create policy "doc_employee_rw" on app.employee_documents
for select using (employee_id in (select id from app.employees where auth_user_id = auth.uid()))
;
create policy "doc_employee_update" on app.employee_documents
for update using (employee_id in (select id from app.employees where auth_user_id = auth.uid()));

-- CLARITY MAP RESULT: funcionário pode ler o seu (via join por CPF no backend); managers leem de sua empresa
-- (Sugestão: acessar via RPC seguro; aqui liberamos leitura para managers via endpoint de service role)

-- VIDEOS: públicos (somente select)
create policy "videos_public_select" on app.videos
for select using (true);

-- VIDEO PROGRESS: funcionário lê/edita o seu; manager pode ler para relatório
create policy "vp_employee_rw" on app.video_progress
for select using (employee_id in (select id from app.employees where auth_user_id = auth.uid()))
;
create policy "vp_employee_update" on app.video_progress
for update using (employee_id in (select id from app.employees where auth_user_id = auth.uid()));

-- CLARITY MAP STATUS: funcionário lê o seu; manager lê da própria empresa
create policy "cms_employee_select" on app.clarity_map_status
for select using (employee_id in (select id from app.employees where auth_user_id = auth.uid()));

-- WEBHOOK LOGS: somente service role (sem policy de select para usuários comuns)
```

> **Observação**: Para operações administrativas (ex.: criar empresa após pagamento aprovado, gerar login-links), use **Service Role** no backend (fora do contexto do usuário), evitando abrir RLS além do necessário.

---

## Fluxos

### 1) Checkout — Jornada de Equipe (Asaas)

* **Tela 1 (Checkout)**: formulário mínimo

  * Empresa: `nome_empresa` (texto)
  * Gestor: `nome_gestor` (texto), `email_gestor` (email), `tempo_empresa` (texto/num), `qtd_funcionarios` (número, **mín. 5**).
  * Valor = `qtd_funcionarios * R$18`.
  * Botão: **Pagar com Asaas** (se `FLAG_ENABLE_PAYMENTS=false`, mostrar aviso “Pagamento desativado no ambiente atual” e simular resposta).
* **Após pagamento aprovado (webhook Asaas)**:

  * Criar `company` (status=`active`), `manager` (vinculado ao `auth_user_id` do Supabase — se não existir, criar usuário auth e convidar).
  * Criar `order` com `status='paid'`, `provider_order_id` e `paid_at`.
  * Gerar **login-links JWT** por funcionário **placeholder** (ou permitir o gestor cadastrar a equipe e gerar os links sob demanda).
  * **Enviar e-mail ao gestor** com URL do **Painel** + link público de convite para funcionários. *(Desativado se `FLAG_ENABLE_EMAILS=false`.)*

### 2) Jornada do Líder

* Form: `nome` + `email` → **redireciona para `HOTMART_CHECKOUT_URL`**.
* Opcional: criar lead no banco para tracking.

### 3) Onboarding do Gestor (após pagamento)

* Tela “Bem-vindo! Cadastre sua equipe (até N)” + **link público** para compartilhamento.
* Ações: Adicionar/Editar funcionário, Reenviar instruções.

### 4) Primeiro acesso do Funcionário (via link JWT)

* Página captura: **Nome, CPF, Data de nascimento, E-mail, WhatsApp** → salva em `employees` e **vincula `auth_user_id`** (cria conta Supabase Auth, se não existir).
* Redireciona para **Área do Funcionário**.

### 5) Área do Funcionário

* **Mapa de Clareza**: busca `clarity_map_results` por **CPF** e exibe o documento (somente leitura). Status em `clarity_map_status`.
* **Guia de Ferramentas**: editor com auto-save em `employee_documents`.
* **Módulo de Vídeos**: lista de `videos` + toggle “Marcar como assistido” que grava em `video_progress`.

### 6) Painel do Gestor

* **Tabela de funcionários**: Nome, Status do Mapa (Não iniciado / Em andamento / Concluído), Progresso (ex.: `3/6`).
* KPIs: **% de cadastros concluídos** = `funcionarios_ativos / quota`.
* Ações: Adicionar/Editar, Reenviar convites.

---

## Endpoints (Next.js /api) — com flags

> Todos retornam `501` se a feature flag estiver `false`.

* `POST /api/checkout/asaas/create`
  **Body**: `{ nameEmpresa, nameGestor, emailGestor, tempoEmpresa, qtd }`
  **Valida** `qtd >= 5`. Cria *intent* no Asaas (ou mock).
  **Retorna**: `checkoutUrl` (ou mock).

* `POST /api/webhooks/asaas`
  **Headers**: assinatura `ASAAS_WEBHOOK_SECRET`.
  **Body**: payload do evento.
  **Ações quando `payment.approved`**:

  1. Upsert `company`, `manager`, `order(status='paid')`.
  2. Gera `employee_login_links` (ou gera um **link público de convite** por empresa).
  3. (Se `FLAG_ENABLE_EMAILS`) envia e-mail com instruções.

* `POST /api/employees/invite` (auth: manager)
  **Body**: `{ employee: {full_name, email, cpf?} }`
  Cria/atualiza `employees`, gera login-link (JWT curto, 24h), salva em `employee_login_links`.

* `POST /api/employees/resend` (auth: manager)
  Reenvia e-mail de instruções (se `FLAG_ENABLE_EMAILS`).

* `POST /api/employee/first-access` (sem auth; via link JWT)
  **Body**: `{ token, full_name, cpf, birth_date, email, whatsapp }` → valida token, upsert do employee, cria `auth.users` se necessário, vincula `auth_user_id`.

* `GET /api/employee/mapa` (auth: employee)
  Retorna `clarity_map_results` por CPF + `clarity_map_status`.

* `POST /api/employee/mapa/status` (auth: employee)
  Atualiza `clarity_map_status` (`in_progress`/`done`).

* `GET /api/videos` (público)
  Lista vídeos ativos ordenados por `position`.

* `POST /api/videos/progress` (auth: employee)
  **Body**: `{ video_id, watched }` → grava em `video_progress`.

* `GET /api/manager/dashboard` (auth: manager)
  Retorna: quota, #funcionários, % cadastrados, status mapa agregado, progresso vídeos agregado.

---

## JWT do login-link (funcionário)

* **Claims**: `{ company_id, order_id (opt), employee_id (opt|null), email (opt), iat, exp }`
* **Fluxo**: se `employee_id` estiver vazio, cria registro ao final do primeiro acesso.
* **Validade**: 24h.
* Assinar com `JWT_SECRET`.

---

## Regras de negócio principais

* **Preço**: `R$18` por funcionário; **mínimo 5**.
* **Empresa ativa** somente após `order.status = 'paid'`.
* **Quota** = `orders.quantity` (somatório de compras, se houver renovos).
* **CPF** é chave para puxar **resultado do Mapa de Clareza**.
* **Status do Mapa** default `not_started`;

  * vira `in_progress` ao primeiro acesso do funcionário à página do mapa;
  * vira `done` quando marcarmos “concluído” (botão do funcionário ou ingestão automática).
* **Progresso de vídeos** = `count(watched=true) / count(videos ativos)`.

---

## Seeds (opcional para dev local)

```sql
insert into app.videos (title, youtube_id, position) values
('Boas-vindas', 'YOUTUBE_ID_1', 1),
('Módulo 1', 'YOUTUBE_ID_2', 2),
('Módulo 2', 'YOUTUBE_ID_3', 3);
```

---

## UI – telas mínimas

* **/checkout**

  * Tabs: “Jornada de Equipe” (form completo) | “Jornada do Líder” (nome+e-mail → botão ir para Hotmart).
  * Valida mínimo de 5 funcionários e mostra total a pagar.
  * Se `FLAG_ENABLE_PAYMENTS=false`, botão fica desabilitado com tooltip “pagamentos desativados”.

* **/gestor** (autenticado)

  * Cards KPI: `% de cadastros`, `Funcionários ativos`, `Vídeos: média assistidos`.
  * Tabela: Nome | E-mail | Status do Mapa | Progresso (x/N) | Ações (Editar, Reenviar).
  * Bloco “Compartilhar link de inscrição”.

* **/funcionario** (autenticado)

  * Abas: **Mapa de Clareza** (mostra resultado por CPF) | **Guia de Ferramentas** (editor autosave) | **Vídeos** (lista + toggle).

* **/acesso** (rota de primeiro acesso via token)

  * Form de perfil: Nome, CPF, Data nasc., Email, WhatsApp → “Concluir”.

---

## Segurança & Privacidade

* **RLS** restritiva; operações de sistema via **Service Role**.
* **Criptografia opcional** (coluna whatsapp) com `ENCRYPTION_KEY`.
* **Validação CPF** no backend (mask + checksum).
* **Assinatura de webhook** Asaas com `ASAAS_WEBHOOK_SECRET`.
* **JWT curto** para login-links, uso único (`used_at`).

---

## Observações sobre integrações (todas DESATIVADAS por padrão)

* **Asaas**: quando `FLAG_ENABLE_PAYMENTS=false`, `/api/checkout/asaas/create` retorna `501`.
* **Webhooks**: `/api/webhooks/asaas` retorna `501` se `FLAG_ENABLE_WEBHOOKS=false`.
* **E-mails**: endpoints que reenviam instruções retornam `501` se `FLAG_ENABLE_EMAILS=false`.
