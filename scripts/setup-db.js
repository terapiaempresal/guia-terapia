#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRole) {
    console.error('❌ Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE são necessárias')
    process.exit(1)
}

const sql = `
-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES managers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT,
  department TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, email)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES managers(id) ON DELETE CASCADE,
  external_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  employee_count INTEGER NOT NULL DEFAULT 0,
  payment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir vídeos de exemplo
INSERT INTO training_videos (title, description, video_url, thumbnail_url, duration, order_index) 
VALUES
  ('Introdução à Terapia Empresarial', 'Conceitos básicos sobre bem-estar no ambiente de trabalho', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', 1800, 1),
  ('Comunicação Eficaz', 'Como melhorar a comunicação interna', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', 2400, 2),
  ('Gestão de Estresse', 'Técnicas para reduzir o estresse no trabalho', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', 2100, 3),
  ('Trabalho em Equipe', 'Fortalecendo as relações interpessoais', 'https://example.com/video4.mp4', 'https://example.com/thumb4.jpg', 1950, 4),
  ('Liderança Positiva', 'Desenvolvendo habilidades de liderança', 'https://example.com/video5.mp4', 'https://example.com/thumb5.jpg', 2700, 5)
ON CONFLICT DO NOTHING;
`

async function createDatabase() {
    console.log('🚀 Criando banco de dados no Supabase...')

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceRole}`,
                'apikey': supabaseServiceRole
            },
            body: JSON.stringify({ query: sql })
        })

        if (response.ok) {
            console.log('✅ Banco de dados criado com sucesso!')
        } else {
            const error = await response.text()
            console.error('❌ Erro na resposta:', error)
        }

    } catch (error) {
        console.error('❌ Erro ao criar banco:', error.message)
    }
}

createDatabase()
