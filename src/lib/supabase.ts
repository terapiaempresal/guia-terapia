import { createClient } from '@supabase/supabase-js'
import { MockDB } from './mock-db'

// No cliente, usar as variáveis expostas pelo Next.js
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Verificar se as variáveis do Supabase estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

// Mock client para desenvolvimento sem Supabase
const mockClient = {
    from: (table: string) => ({
        insert: (data: any) => MockDB.insert(table, data),
        select: (columns?: string) => ({
            eq: (column: string, value: any) => MockDB.select(table),
            single: () => MockDB.select(table).then(result => ({
                ...result,
                data: result.data?.[0] || null
            }))
        }),
        update: (data: any) => ({
            eq: (column: string, value: any) => MockDB.update(table, value, data)
        })
    })
}

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockClient as any

export const supabaseAdmin = isSupabaseConfigured && supabaseServiceRole
    ? createClient(supabaseUrl, supabaseServiceRole)
    : mockClient as any

export const isUsingMockDB = !isSupabaseConfigured
