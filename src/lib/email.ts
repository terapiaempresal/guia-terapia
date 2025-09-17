import nodemailer from 'nodemailer'

interface EmailConfig {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Não verificar certificados para desenvolvimento
        rejectUnauthorized: false
      }
    })
  }

  async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      console.log('🔧 [EmailService] Iniciando envio de email...')
      console.log('📧 [EmailService] Destinatário:', config.to)
      console.log('📝 [EmailService] Assunto:', config.subject)
      console.log('🏃 [EmailService] Ambiente:', process.env.NODE_ENV)

      // Verificar configurações SMTP
      console.log('🔑 [EmailService] SMTP Host:', process.env.SMTP_HOST)
      console.log('🔑 [EmailService] SMTP Port:', process.env.SMTP_PORT)
      console.log('🔑 [EmailService] SMTP User configurado:', !!process.env.SMTP_USER)
      console.log('🔑 [EmailService] SMTP Pass configurado:', !!process.env.SMTP_PASS)
      console.log('📨 [EmailService] Email remetente:', process.env.EMAIL_FROM)

      if (!process.env.SMTP_HOST) {
        console.error('❌ [EmailService] SMTP_HOST não configurado!')
        return false
      }

      if (!process.env.SMTP_USER) {
        console.error('❌ [EmailService] SMTP_USER não configurado!')
        return false
      }

      if (!process.env.SMTP_PASS) {
        console.error('❌ [EmailService] SMTP_PASS não configurado!')
        return false
      }

      if (!process.env.EMAIL_FROM) {
        console.error('❌ [EmailService] EMAIL_FROM não configurado!')
        return false
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: config.to,
        subject: config.subject,
        html: config.html,
        text: config.text || this.htmlToText(config.html)
      }

      console.log('📤 [EmailService] Configurações do email:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        hasText: !!mailOptions.text
      })

      console.log('🚀 [EmailService] Enviando email via SMTP...')
      const result = await this.transporter.sendMail(mailOptions)

      console.log('✅ [EmailService] Email enviado com sucesso!')
      console.log('📋 [EmailService] Message ID:', result.messageId)
      console.log('📋 [EmailService] Response:', result.response)
      return true
    } catch (error) {
      console.error('❌ [EmailService] Erro ao enviar email:', error)
      console.error('❌ [EmailService] Tipo do erro:', typeof error)
      console.error('❌ [EmailService] Stack trace:', error instanceof Error ? error.stack : 'N/A')

      if (error instanceof Error) {
        console.error('❌ [EmailService] Mensagem do erro:', error.message)
        console.error('❌ [EmailService] Nome do erro:', error.name)
      }

      return false
    }
  }

  private htmlToText(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  // Templates de e-mail
  static getWelcomeManagerTemplate(managerName: string, companyName: string, dashboardUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { padding: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao Guia de Terapia!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${managerName}!</h2>
            <p>Seu pagamento foi confirmado e sua conta da empresa <strong>${companyName}</strong> foi criada com sucesso!</p>
            
            <p>Agora você pode:</p>
            <ul>
              <li>Acessar seu painel gerencial</li>
              <li>Adicionar funcionários à sua equipe</li>
              <li>Acompanhar o progresso de desenvolvimento</li>
              <li>Enviar convites de acesso</li>
            </ul>

            <a href="${dashboardUrl}" class="button">Acessar Painel do Gestor</a>

            <p><strong>Próximos passos:</strong></p>
            <ol>
              <li>Acesse o painel do gestor</li>
              <li>Adicione os funcionários da sua equipe</li>
              <li>Envie os convites de acesso</li>
              <li>Acompanhe o progresso da jornada</li>
            </ol>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente. Não responda este e-mail.</p>
            <p>Guia de Terapia - Desenvolvimento de Equipes e Liderança</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  static getEmployeeInviteTemplate(employeeName: string, companyName: string, loginUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { padding: 20px; font-size: 12px; color: #666; text-align: center; }
          .important { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Você foi convidado!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${employeeName}!</h2>
            <p>Você foi convidado para participar da <strong>Jornada de Desenvolvimento</strong> da empresa <strong>${companyName}</strong>!</p>
            
            <div class="important">
              <strong>⚠️ Importante:</strong> Este link de acesso é válido por 24 horas e pode ser usado apenas uma vez.
            </div>

            <p>O que você encontrará na plataforma:</p>
            <ul>
              <li><strong>Mapa de Clareza:</strong> Descubra seu perfil de liderança personalizado</li>
              <li><strong>Módulos de Vídeo:</strong> Conteúdo exclusivo para seu desenvolvimento</li>
              <li><strong>Guia de Ferramentas:</strong> Espaço para anotações e exercícios práticos</li>
            </ul>

            <a href="${loginUrl}" class="button">Acessar Minha Área</a>

            <p><strong>Primeiro acesso:</strong></p>
            <ol>
              <li>Clique no link acima</li>
              <li>Complete seu perfil (Nome, CPF, Data de nascimento, etc.)</li>
              <li>Comece sua jornada de desenvolvimento!</li>
            </ol>

            <p>Se tiver alguma dúvida, entre em contato com seu gestor.</p>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente. Não responda este e-mail.</p>
            <p>Guia de Terapia - Desenvolvimento de Equipes e Liderança</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export default EmailService
