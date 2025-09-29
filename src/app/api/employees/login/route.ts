import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateInitialPassword, validatePasswordAgainstBirthDate } from '@/lib/password-utils'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-super-secreta-aqui'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { cpf, password, birthDate } = body

        if (!cpf) {
            return NextResponse.json(
                { error: 'CPF é obrigatório' },
                { status: 400 }
            )
        }

        if (!password && !birthDate) {
            return NextResponse.json(
                { error: 'Senha ou data de nascimento é obrigatória' },
                { status: 400 }
            )
        }

        // Limpar o CPF (remover pontos e traços)
        const cleanCPF = cpf.replace(/\D/g, '')

        // Buscar funcionário pelo CPF
        const { data: employee, error } = await supabase
            .from('employees')
            .select(`
                *,
                company:companies(name),
                manager:managers(name, email)
            `)
            .eq('cpf', cleanCPF)
            .single()

        if (error) {
            console.error('Erro ao buscar funcionário:', error)
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        if (!employee) {
            return NextResponse.json(
                { error: 'CPF não encontrado. Verifique se você está cadastrado.' },
                { status: 404 }
            )
        }

        // Verificar autenticação
        let isAuthenticated = false;
        let needsPasswordSetup = false;

        if (employee.password) {
            // Funcionário já tem senha personalizada
            if (password && employee.password === password) {
                isAuthenticated = true;
            }
        } else {
            // Funcionário ainda não configurou senha personalizada
            if (password) {
                // Verificar se a senha corresponde à data de nascimento
                if (employee.birth_date && validatePasswordAgainstBirthDate(password, employee.birth_date)) {
                    isAuthenticated = true;
                    needsPasswordSetup = true;
                }
            } else if (birthDate) {
                // Compatibilidade com o sistema antigo (temporário)
                if (employee.birth_date === birthDate) {
                    isAuthenticated = true;
                    needsPasswordSetup = true;
                }
            }
        }

        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Senha incorreta. Tente novamente.' },
                { status: 401 }
            )
        }

        // Gerar token JWT para o funcionário
        const token = jwt.sign(
            {
                id: employee.id,
                type: 'employee',
                cpf: employee.cpf,
                company_id: employee.company_id
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        // Se é o primeiro login com senha baseada na data, sugerir alteração
        const response = {
            success: true,
            employee,
            token,
            needsPasswordSetup,
            initialPassword: needsPasswordSetup && employee.birth_date
                ? generateInitialPassword(employee.birth_date)
                : undefined
        };

        return NextResponse.json(response)

    } catch (error) {
        console.error('Erro interno:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
