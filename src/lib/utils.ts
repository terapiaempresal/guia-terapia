import jwt from 'jsonwebtoken'

export interface JWTPayload {
    company_id: string
    order_id?: string
    employee_id?: string
    email?: string
    iat?: number
    exp?: number
}

export function generateEmployeeLoginToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const secret = process.env.JWT_SECRET!
    return jwt.sign(payload, secret, { expiresIn: '24h' })
}

export function verifyEmployeeLoginToken(token: string): JWTPayload {
    const secret = process.env.JWT_SECRET!
    return jwt.verify(token, secret) as JWTPayload
}

export function cpfValidator(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '')

    if (cleaned.length !== 11) return false

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleaned)) return false

    // Validação dos dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned[i]) * (10 - i)
    }
    let digit1 = (sum * 10) % 11
    if (digit1 === 10) digit1 = 0

    if (parseInt(cleaned[9]) !== digit1) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned[i]) * (11 - i)
    }
    let digit2 = (sum * 10) % 11
    if (digit2 === 10) digit2 = 0

    return parseInt(cleaned[10]) === digit2
}

export function formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '')
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function encrypt(text: string): string {
    // Implementação simples - em produção usar crypto real
    const key = process.env.ENCRYPTION_KEY || ''
    if (!key) return text

    // Placeholder para criptografia real
    return Buffer.from(text).toString('base64')
}

export function decrypt(encryptedText: string): string {
    // Implementação simples - em produção usar crypto real
    const key = process.env.ENCRYPTION_KEY || ''
    if (!key) return encryptedText

    try {
        return Buffer.from(encryptedText, 'base64').toString()
    } catch {
        return encryptedText
    }
}
