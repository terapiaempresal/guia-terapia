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

-- Editor "Google Docs light" (auto-save)
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

-- RLS
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

-- Seeds para desenvolvimento
insert into app.videos (title, youtube_id, position) values
('Boas-vindas', 'YOUTUBE_ID_1', 1),
('Módulo 1', 'YOUTUBE_ID_2', 2),
('Módulo 2', 'YOUTUBE_ID_3', 3)
on conflict do nothing;
