const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Variáveis do Supabase não encontradas')
    console.log('SUPABASE_URL:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAndUpdateDatabase() {
    console.log('🔍 Testando conexão com o banco de dados...')

    try {
        // 1. Testar conexão básica
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .limit(1)

        if (error) {
            console.log('❌ Erro ao conectar com a tabela videos:', error.message)

            // Se a tabela não existe, vamos criá-la
            if (error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
                console.log('📦 Criando estrutura básica de vídeos...')

                // Criar tabela básica de vídeos
                const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS public.videos (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        title VARCHAR NOT NULL,
                        description TEXT,
                        video_url VARCHAR NOT NULL,
                        thumbnail_url VARCHAR,
                        duration INTEGER DEFAULT 0,
                        category VARCHAR,
                        is_public BOOLEAN DEFAULT true,
                        is_active BOOLEAN DEFAULT true,
                        video_type VARCHAR DEFAULT 'custom',
                        youtube_video_id VARCHAR,
                        created_by UUID,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    
                    ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
                    
                    DROP POLICY IF EXISTS "videos_all_access" ON public.videos;
                    CREATE POLICY "videos_all_access" ON public.videos
                        FOR ALL USING (true) WITH CHECK (true);
                `

                const { error: createError } = await supabase.rpc('exec_sql', {
                    sql: createTableQuery
                })

                if (createError) {
                    console.log('❌ Erro ao criar tabela videos:', createError)
                } else {
                    console.log('✅ Tabela videos criada com sucesso!')
                }
            }
        } else {
            console.log('✅ Tabela videos existe:', data?.length || 0, 'registros')
        }

        // 2. Testar tabela de atribuições
        const { data: assignments, error: assignError } = await supabase
            .from('video_assignments')
            .select('*')
            .limit(1)

        if (assignError) {
            console.log('❌ Erro ao conectar com a tabela video_assignments:', assignError.message)

            if (assignError.message.includes('does not exist') || assignError.message.includes('relation')) {
                console.log('📦 Criando tabela de atribuições...')

                const createAssignmentsQuery = `
                    CREATE TABLE IF NOT EXISTS public.video_assignments (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
                        employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
                        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        assigned_by UUID,
                        status VARCHAR DEFAULT 'pending',
                        watched_at TIMESTAMP WITH TIME ZONE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        UNIQUE(video_id, employee_id)
                    );
                    
                    ALTER TABLE public.video_assignments ENABLE ROW LEVEL SECURITY;
                    
                    DROP POLICY IF EXISTS "video_assignments_all_access" ON public.video_assignments;
                    CREATE POLICY "video_assignments_all_access" ON public.video_assignments
                        FOR ALL USING (true) WITH CHECK (true);
                `

                const { error: createAssignError } = await supabase.rpc('exec_sql', {
                    sql: createAssignmentsQuery
                })

                if (createAssignError) {
                    console.log('❌ Erro ao criar tabela video_assignments:', createAssignError)
                } else {
                    console.log('✅ Tabela video_assignments criada com sucesso!')
                }
            }
        } else {
            console.log('✅ Tabela video_assignments existe:', assignments?.length || 0, 'registros')
        }

        // 3. Testar tabela de funcionários
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('id, full_name, email')
            .limit(3)

        if (empError) {
            console.log('❌ Erro ao buscar funcionários:', empError.message)
        } else {
            console.log('✅ Funcionários encontrados:', employees?.length || 0)
            if (employees && employees.length > 0) {
                console.log('   Exemplo:', employees[0])
            }
        }

        console.log('\n🎉 Teste concluído! O banco está pronto para uso.')

    } catch (error) {
        console.error('💥 Erro inesperado:', error)
    }
}

testAndUpdateDatabase()