import { NextRequest, NextResponse } from 'next/server';
import EmailService from '@/lib/EmailService';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        // Enviar email de teste
        const emailSent = await EmailService.sendWelcomeManager(
            email,
            'Teste do Sistema',
            'Sistema de Terapia',
            'teste123'
        );

        if (emailSent) {
            return NextResponse.json({
                success: true,
                message: 'Email de teste enviado com sucesso!'
            });
        } else {
            return NextResponse.json({
                error: 'Falha ao enviar email de teste'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Erro no teste de email:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
