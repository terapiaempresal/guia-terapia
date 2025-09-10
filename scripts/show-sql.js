require('dotenv').config({ path: '.env.local' });

console.log('🚀 Script para criar tabelas do Supabase');
console.log('');
console.log('⚠️  O Supabase não permite execução direta de SQL via API por segurança.');
console.log('📋 Para criar as tabelas, siga os passos:');
console.log('');
console.log('1. Acesse: https://supabase.com/dashboard');
console.log('2. Entre no seu projeto');
console.log('3. Vá em "SQL Editor" no menu lateral');
console.log('4. Copie e cole o SQL abaixo:');
console.log('');
console.log('='.repeat(60));
console.log(`
-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de gestores
CREATE TABLE IF NOT EXISTS public.managers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.managers(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, email)
);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.managers(id) ON DELETE CASCADE,
    asaas_payment_id VARCHAR,
    status VARCHAR DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    employee_count INTEGER NOT NULL,
    company_time VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de vídeos
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    video_url VARCHAR NOT NULL,
    thumbnail_url VARCHAR,
    duration INTEGER, -- em segundos
    category VARCHAR,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de progresso dos funcionários
CREATE TABLE IF NOT EXISTS public.employee_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    watched_duration INTEGER DEFAULT 0, -- em segundos
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, video_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para companies
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies are insertable by everyone" ON public.companies;
CREATE POLICY "Companies are insertable by everyone" ON public.companies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Companies are updatable by everyone" ON public.companies;
CREATE POLICY "Companies are updatable by everyone" ON public.companies FOR UPDATE USING (true);

-- Políticas RLS para managers
DROP POLICY IF EXISTS "Managers are viewable by everyone" ON public.managers;
CREATE POLICY "Managers are viewable by everyone" ON public.managers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers are insertable by everyone" ON public.managers;
CREATE POLICY "Managers are insertable by everyone" ON public.managers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Managers are updatable by everyone" ON public.managers;
CREATE POLICY "Managers are updatable by everyone" ON public.managers FOR UPDATE USING (true);

-- Políticas RLS para employees
DROP POLICY IF EXISTS "Employees are viewable by everyone" ON public.employees;
CREATE POLICY "Employees are viewable by everyone" ON public.employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employees are insertable by everyone" ON public.employees;
CREATE POLICY "Employees are insertable by everyone" ON public.employees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Employees are updatable by everyone" ON public.employees;
CREATE POLICY "Employees are updatable by everyone" ON public.employees FOR UPDATE USING (true);

-- Políticas RLS para orders
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;
CREATE POLICY "Orders are viewable by everyone" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Orders are insertable by everyone" ON public.orders;
CREATE POLICY "Orders are insertable by everyone" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Orders are updatable by everyone" ON public.orders;
CREATE POLICY "Orders are updatable by everyone" ON public.orders FOR UPDATE USING (true);

-- Políticas RLS para videos
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON public.videos;
CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Videos are insertable by everyone" ON public.videos;
CREATE POLICY "Videos are insertable by everyone" ON public.videos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Videos are updatable by everyone" ON public.videos;
CREATE POLICY "Videos are updatable by everyone" ON public.videos FOR UPDATE USING (true);

-- Políticas RLS para employee_progress
DROP POLICY IF EXISTS "Employee progress is viewable by everyone" ON public.employee_progress;
CREATE POLICY "Employee progress is viewable by everyone" ON public.employee_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employee progress is insertable by everyone" ON public.employee_progress;
CREATE POLICY "Employee progress is insertable by everyone" ON public.employee_progress FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Employee progress is updatable by everyone" ON public.employee_progress;
CREATE POLICY "Employee progress is updatable by everyone" ON public.employee_progress FOR UPDATE USING (true);

-- Inserir alguns vídeos de exemplo
INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration, category, is_public) VALUES
('Introdução à Terapia Empresarial', 'Conceitos básicos sobre terapia no ambiente corporativo', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', 600, 'introducao', true),
('Gestão de Conflitos', 'Como resolver conflitos entre equipes', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', 900, 'gestao', true),
('Comunicação Assertiva', 'Técnicas de comunicação eficaz no trabalho', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', 750, 'comunicacao', true),
('Liderança Positiva', 'Desenvolvendo habilidades de liderança', 'https://example.com/video4.mp4', 'https://example.com/thumb4.jpg', 1200, 'lideranca', true),
('Bem-estar no Trabalho', 'Promovendo saúde mental no ambiente corporativo', 'https://example.com/video5.mp4', 'https://example.com/thumb5.jpg', 800, 'bem-estar', true)
ON CONFLICT DO NOTHING;
`);
console.log('='.repeat(60));
console.log('');
console.log('5. Clique em "Run" para executar');
console.log('');
console.log('✅ Depois disso, volte aqui e teste: npm run test-db');
console.log('');
