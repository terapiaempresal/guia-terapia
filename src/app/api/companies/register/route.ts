import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { company, manager } = body

        // Validações
        if (!company?.name || !company?.employees_quota) {
            return NextResponse.json(
                { success: false, error: 'Dados da empresa incompletos' },
                { status: 400 }
            )
        }

        if (!manager?.full_name || !manager?.email || !manager?.password) {
            return NextResponse.json(
                { success: false, error: 'Dados do gestor incompletos' },
                { status: 400 }
            )
        }

        if (company.employees_quota < 5) {
            return NextResponse.json(
                { success: false, error: 'Número mínimo de funcionários é 5' },
                { status: 400 }
            )
        }

        if (manager.password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'A senha deve ter no mínimo 6 caracteres' },
                { status: 400 }
            )
        }

        // Verificar se email já existe
        const { data: existingManager } = await supabase
            .from('managers')
            .select('id')
            .eq('email', manager.email.toLowerCase())
            .single()

        if (existingManager) {
            return NextResponse.json(
                { success: false, error: 'Email já cadastrado' },
                { status: 400 }
            )
        }

        // 1. Criar usuário no Supabase Auth usando signup público
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: manager.email.toLowerCase(),
            password: manager.password,
            options: {
                data: {
                    full_name: manager.full_name,
                    role: 'manager'
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
            }
        })

        if (authError || !authData.user) {
            console.error('Erro ao criar usuário auth:', authError)
            return NextResponse.json(
                { success: false, error: authError?.message || 'Erro ao criar conta de acesso' },
                { status: 500 }
            )
        }

        // Criar empresa (apenas name primeiro, devido ao cache do PostgREST)
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({
                name: company.name
            })
            .select()
            .single()

        if (companyError || !companyData) {
            console.error('Erro ao criar empresa:', companyError)

            // Nota: Usuário auth criado mas sem empresa/gestor vinculado
            // Pode ser tratado posteriormente ou o usuário pode tentar cadastro novamente

            return NextResponse.json(
                { success: false, error: 'Erro ao criar empresa. Tente novamente.' },
                { status: 500 }
            )
        }

        // Atualizar campos adicionais via SQL direto (bypassa cache do PostgREST)
        const { error: updateError } = await supabase.rpc('update_company_fields', {
            company_id: companyData.id,
            emp_quota: company.employees_quota || 5,
            company_plan: 'equipe',
            company_status: 'inactive'
        })

        if (updateError) {
            console.warn('Aviso: Não foi possível definir quota/plan/status:', updateError)
            // Continua mesmo com erro - campos terão valores default do SQL
        }

        // 3. Criar gestor vinculado à empresa via SQL direto (bypassa cache)
        const { data: managerIdData, error: managerError } = await supabase.rpc('insert_manager', {
            p_auth_user_id: authData.user.id,
            p_company_id: companyData.id,
            p_full_name: manager.full_name,
            p_email: manager.email.toLowerCase(),
            p_phone: manager.phone || null,
            p_status: 'inactive'
        })

        if (managerError) {
            console.error('Erro ao criar gestor:', managerError)

            // Reverter criação da empresa
            await supabase
                .from('companies')
                .delete()
                .eq('id', companyData.id)

            // Nota: Usuário auth criado mas sem empresa/gestor vinculado
            // Pode ser tratado posteriormente ou o usuário pode tentar cadastro novamente

            return NextResponse.json(
                { success: false, error: 'Erro ao criar perfil de gestor. Tente novamente.' },
                { status: 500 }
            )
        }

        // TODO: Enviar email com instruções de pagamento

        return NextResponse.json({
            success: true,
            data: {
                company_id: companyData.id,
                manager_id: managerIdData, // UUID retornado pela função SQL
                status: 'inactive'
            }
        })

    } catch (error) {
        console.error('Erro ao registrar empresa:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
