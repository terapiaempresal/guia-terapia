#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

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
        // 1. Criar tabela companies
        console.log('📝 Criando tabela companies...')
        await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        })

        // 2. Criar tabela managers
        console.log('📝 Criando tabela managers...')
        await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS managers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        })

        // 3. Criar tabela employees
        console.log('📝 Criando tabela employees...')
        await supabase.rpc('exec_sql', {
            sql: `
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
      `
        })

        // 4. Criar tabela orders
        console.log('📝 Criando tabela orders...')
        await supabase.rpc('exec_sql', {
            sql: `
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
      `
        })

        // 5. Criar tabela training_videos
        console.log('📝 Criando tabela training_videos...')
        await supabase.rpc('exec_sql', {
            sql: `
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
      `
        })

        console.log('✅ Todas as tabelas foram criadas com sucesso!')

        // Verificar se as tabelas existem
        const { data: companies } = await supabase.from('companies').select('count').limit(1)
        console.log('🔍 Teste de conexão com tabela companies:', companies ? '✅' : '❌')

    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error.message)
    }
}

createTables()
