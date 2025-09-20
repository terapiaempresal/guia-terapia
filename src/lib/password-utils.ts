// Utilitários para geração e validação de senhas baseadas em data de aniversário

/**
 * Gera senha inicial baseada na data de aniversário no formato ddmmyyyy
 * @param birthDate - Data no formato YYYY-MM-DD ou DD/MM/YYYY
 * @returns Senha no formato ddmmyyyy (ex: "19091990")
 */
export function generateInitialPassword(birthDate: string): string {
    let date: Date;

    // Aceitar diferentes formatos de data
    if (birthDate.includes('/')) {
        // Formato DD/MM/YYYY
        const [day, month, year] = birthDate.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (birthDate.includes('-')) {
        // Formato YYYY-MM-DD
        date = new Date(birthDate);
    } else {
        throw new Error('Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD');
    }

    // Validar se a data é válida
    if (isNaN(date.getTime())) {
        throw new Error('Data de nascimento inválida');
    }

    // Validar se a data não é futura
    if (date > new Date()) {
        throw new Error('Data de nascimento não pode ser futura');
    }

    // Validar se a pessoa tem idade razoável (entre 16 e 100 anos)
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
    }

    if (actualAge < 16 || actualAge > 100) {
        throw new Error('Idade deve estar entre 16 e 100 anos');
    }

    // Gerar senha no formato ddmmyyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}${month}${year}`;
}

/**
 * Valida se uma senha corresponde ao formato de data de aniversário
 * @param password - Senha a ser validada
 * @param birthDate - Data de nascimento no formato YYYY-MM-DD ou DD/MM/YYYY
 * @returns true se a senha corresponde à data de aniversário
 */
export function validatePasswordAgainstBirthDate(password: string, birthDate: string): boolean {
    try {
        const expectedPassword = generateInitialPassword(birthDate);
        return password === expectedPassword;
    } catch {
        return false;
    }
}

/**
 * Valida se uma senha tem formato e comprimento adequados
 * @param password - Senha a ser validada
 * @returns Objeto com resultado da validação e mensagens de erro
 */
export function validatePasswordFormat(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
        errors.push('Senha é obrigatória');
        return { valid: false, errors };
    }

    if (password.length < 4) {
        errors.push('Senha deve ter pelo menos 4 caracteres');
    }

    if (password.length > 50) {
        errors.push('Senha deve ter no máximo 50 caracteres');
    }

    // Permitir apenas números, letras e alguns caracteres especiais básicos
    const allowedChars = /^[a-zA-Z0-9@#$%&*!_-]+$/;
    if (!allowedChars.test(password)) {
        errors.push('Senha contém caracteres não permitidos');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Formata data de nascimento para exibição
 * @param birthDate - Data no formato YYYY-MM-DD
 * @returns Data formatada como DD/MM/YYYY
 */
export function formatBirthDateForDisplay(birthDate: string): string {
    if (!birthDate) return '';

    try {
        const date = new Date(birthDate);
        if (isNaN(date.getTime())) return birthDate;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    } catch {
        return birthDate;
    }
}

/**
 * Converte data do formato DD/MM/YYYY para YYYY-MM-DD
 * @param dateString - Data no formato DD/MM/YYYY
 * @returns Data no formato YYYY-MM-DD
 */
export function convertDateToISO(dateString: string): string {
    if (!dateString) return '';

    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return dateString;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}