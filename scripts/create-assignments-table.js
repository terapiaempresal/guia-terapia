const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createVideoAssignmentsTable() {
    console.log('📦 Criando tabela video_assignments...')

    try {
        // Executar o SQL diretamente
        const { data, error } = await supabase
            .rpc('exec_sql', {
                sql: `
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
                        
                    CREATE INDEX IF NOT EXISTS idx_video_assignments_video_id ON public.video_assignments(video_id);
                    CREATE INDEX IF NOT EXISTS idx_video_assignments_employee_id ON public.video_assignments(employee_id);
                `
            })

        if (error) {
            console.log('❌ Erro ao executar SQL:', error)
        } else {
            console.log('✅ Tabela video_assignments criada com sucesso!')
        }

        // Testar se funcionou
        const { data: testData, error: testError } = await supabase
            .from('video_assignments')
            .select('*')
            .limit(1)

        if (testError) {
            console.log('❌ Erro ao testar tabela:', testError.message)
        } else {
            console.log('✅ Tabela funcionando:', testData?.length || 0, 'registros')
        }

    } catch (error) {
        console.error('💥 Erro inesperado:', error)
    }
}

createVideoAssignmentsTable()