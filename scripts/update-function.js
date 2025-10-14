// Executar SQL via Node (SERVICE ROLE)
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function executeSQL() {
    console.log('🔧 Atualizando função insert_manager...\n')

    const sql = `
    CREATE OR REPLACE FUNCTION public.insert_manager(
        p_auth_user_id uuid,
        p_company_id uuid,
        p_full_name text,
        p_email text,
        p_phone text,
        p_status text
    ) RETURNS uuid AS $$
    DECLARE
        new_manager_id uuid;
    BEGIN
        INSERT INTO public.managers (
            auth_user_id,
            company_id,
            name,
            full_name,
            email,
            phone,
            status
        ) VALUES (
            p_auth_user_id,
            p_company_id,
            p_full_name,
            p_full_name,
            p_email,
            p_phone,
            p_status
        )
        RETURNING id INTO new_manager_id;
        
        RETURN new_manager_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    GRANT EXECUTE ON FUNCTION public.insert_manager(uuid, uuid, text, text, text, text) TO anon, authenticated, service_role;
  `

    try {
        // Tentar via query raw
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ query: sql })
        })

        console.log('📋 Copie e execute este SQL no Supabase SQL Editor:\n')
        console.log(sql)
        console.log('\n✅ Depois execute: node scripts/test-direct.js')

    } catch (error) {
        console.log('❌ Erro:', error.message)
        console.log('\n📋 Execute manualmente no SQL Editor:\n')
        console.log(sql)
    }
}

executeSQL()
