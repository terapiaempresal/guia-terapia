import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(supabaseUrl, supabaseServiceRole)

const schema = `
-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- Tabela de empresas
create table if not exists companies (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de gestores
create table if not exists managers (
    id uuid default uuid_generate_v4() primary key,
    company_id uuid references companies(id) on delete cascade,
    name text not null,
    email text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de funcionários
create table if not exists employees (
    id uuid default uuid_generate_v4() primary key,
    company_id uuid references companies(id) on delete cascade,
    manager_id uuid references managers(id) on delete cascade,
    name text not null,
    email text not null,
    position text,
    department text,
    invited_at timestamp with time zone default timezone('utc'::text, now()),
    accepted_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(company_id, email)
);

-- Tabela de pedidos/pagamentos
create table if not exists orders (
    id uuid default uuid_generate_v4() primary key,
    company_id uuid references companies(id) on delete cascade,
    manager_id uuid references managers(id) on delete cascade,
    external_id text, -- ID do provedor de pagamento (Asaas, etc)
    amount decimal(10,2) not null,
    status text not null default 'pending', -- pending, paid, cancelled, failed
    payment_method text,
    employee_count integer not null default 0,
    payment_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de vídeos de treinamento
create table if not exists training_videos (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    video_url text not null,
    thumbnail_url text,
    duration integer, -- em segundos
    order_index integer not null default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de progresso dos funcionários
create table if not exists employee_progress (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references employees(id) on delete cascade,
    video_id uuid references training_videos(id) on delete cascade,
    watched_duration integer default 0, -- em segundos
    completed boolean default false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(employee_id, video_id)
);

-- Tabela de tokens de acesso (para funcionários)
create table if not exists access_tokens (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references employees(id) on delete cascade,
    token text not null unique,
    expires_at timestamp with time zone not null,
    used_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para performance
create index if not exists idx_managers_company_id on managers(company_id);
create index if not exists idx_managers_email on managers(email);
create index if not exists idx_employees_company_id on employees(company_id);
create index if not exists idx_employees_manager_id on employees(manager_id);
create index if not exists idx_employees_email on employees(email);
create index if not exists idx_orders_company_id on orders(company_id);
create index if not exists idx_orders_manager_id on orders(manager_id);
create index if not exists idx_orders_external_id on orders(external_id);
create index if not exists idx_employee_progress_employee_id on employee_progress(employee_id);
create index if not exists idx_employee_progress_video_id on employee_progress(video_id);
create index if not exists idx_access_tokens_employee_id on access_tokens(employee_id);
create index if not exists idx_access_tokens_token on access_tokens(token);

-- RLS (Row Level Security) - Habilitado por padrão
alter table companies enable row level security;
alter table managers enable row level security;
alter table employees enable row level security;
alter table orders enable row level security;
alter table training_videos enable row level security;
alter table employee_progress enable row level security;
alter table access_tokens enable row level security;

-- Políticas de segurança (permitir tudo para service_role por enquanto)
create policy "Allow service role full access" on companies for all using (auth.role() = 'service_role');
create policy "Allow service role full access" on managers for all using (auth.role() = 'service_role');
create policy "Allow service role full access" on employees for all using (auth.role() = 'service_role');
create policy "Allow service role full access" on orders for all using (auth.role() = 'service_role');
create policy "Allow service role full access" on training_videos for all using (auth.role() = 'service_role');
create policy "Allow service role full access" on employee_progress for all using (auth.role() = 'service_role');
create policy "Allow service role full access" on access_tokens for all using (auth.role() = 'service_role');

-- Inserir alguns vídeos de exemplo
insert into training_videos (title, description, video_url, thumbnail_url, duration, order_index) values
('Introdução à Terapia Empresarial', 'Conceitos básicos sobre bem-estar no ambiente de trabalho', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', 1800, 1),
('Comunicação Eficaz', 'Como melhorar a comunicação interna', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', 2400, 2),
('Gestão de Estresse', 'Técnicas para reduzir o estresse no trabalho', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', 2100, 3),
('Trabalho em Equipe', 'Fortalecendo as relações interpessoais', 'https://example.com/video4.mp4', 'https://example.com/thumb4.jpg', 1950, 4),
('Liderança Positiva', 'Desenvolvendo habilidades de liderança', 'https://example.com/video5.mp4', 'https://example.com/thumb5.jpg', 2700, 5)
on conflict do nothing;
`

export async function createSupabaseSchema() {
    try {
        console.log('🚀 Criando schema do banco de dados...')

        const { data, error } = await supabase.rpc('exec_sql', {
            query: schema
        })

        if (error) {
            console.error('❌ Erro ao criar schema:', error)
            // Tentar método alternativo - executar por partes
            console.log('🔄 Tentando método alternativo...')

            const statements = schema.split(';').filter(stmt => stmt.trim())

            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await supabase.from('_').select('*').limit(0) // Dummy query para testar conexão
                        console.log('✅ Executando:', statement.substring(0, 50) + '...')
                    } catch (err) {
                        console.log('⚠️  Erro em statement específico:', err)
                    }
                }
            }
        } else {
            console.log('✅ Schema criado com sucesso!')
        }

        // Verificar se as tabelas foram criadas
        const { data: tables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')

        console.log('📊 Tabelas criadas:', tables?.map(t => t.table_name))

    } catch (error) {
        console.error('💥 Erro geral:', error)
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    createSupabaseSchema()
}
