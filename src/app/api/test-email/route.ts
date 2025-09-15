import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        // Criar instância do serviço de email
        const emailService = new EmailService();

        // Enviar email de teste usando o template de boas-vindas
        const emailSent = await emailService.sendEmail({
            to: email,
            subject: 'Teste do Sistema - Guia de Terapia',
            html: EmailService.getWelcomeManagerTemplate(
                'Teste do Sistema',
                'Sistema de Terapia',
                `${process.env.NEXT_PUBLIC_BASE_URL}/gestor`
            )
        });

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
