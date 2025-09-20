-- Adicionar campo 'password' na tabela employees para sistema de senha customizável
-- A senha inicial será baseada na data de aniversário (ddmmyyyy) mas pode ser alterada

-- Adicionar campo password (texto, não obrigatório inicialmente)
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Criar índice para otimizar consultas de login
CREATE INDEX IF NOT EXISTS employees_cpf_idx ON public.employees(cpf);

-- Comentários
COMMENT ON COLUMN public.employees.password IS 'Senha customizável do funcionário (inicial baseada na data de aniversário ddmmyyyy)';

-- Função para gerar senha inicial baseada na data de aniversário
-- Esta função será chamada via API quando necessário
CREATE OR REPLACE FUNCTION generate_initial_password_from_birthdate(birth_date DATE)
RETURNS VARCHAR AS $$
BEGIN
    -- Converter data para formato ddmmyyyy
    -- Ex: 1990-09-19 -> 19091990
    RETURN TO_CHAR(birth_date, 'DDMMYYYY');
END;
$$ LANGUAGE plpgsql;