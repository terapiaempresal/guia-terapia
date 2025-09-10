const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRole) {
    console.error('❌ Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE são necessárias')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function createTables() {
    console.log('🚀 Criando tabelas do banco de dados...')

    try {
        // Vamos usar o método mais direto - inserir dados de teste primeiro
        // para verificar se a conexão funciona

        console.log('🔍 Testando conexão...')

        // Se não houver tabelas, criar uma simples primeiro
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .limit(1)

        if (error && error.message.includes('relation "companies" does not exist')) {
            console.log('📝 Tabelas não existem, vamos criá-las via SQL direto...')

            // Como não podemos executar SQL diretamente via client,
            // vamos mostrar as instruções para o usuário
            console.log(`
🔧 INSTRUÇÕES PARA CRIAR AS TABELAS:

1. Acesse o painel do Supabase: ${supabaseUrl.replace('/rest/v1', '')}/project/default/sql
2. Cole e execute o seguinte SQL:

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

3. Após executar, rode novamente este script para testar a conexão.
      `)
        } else if (error) {
            console.error('❌ Erro de conexão:', error.message)
        } else {
            console.log('✅ Conexão com banco funcionando!')
            console.log('📊 Dados encontrados:', data?.length || 0, 'empresas')
        }

    } catch (error) {
        console.error('❌ Erro:', error.message)
    }
}

createTables()
