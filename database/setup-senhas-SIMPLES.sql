-- SQL SIMPLIFICADO - Execute este script no SQL Editor do Supabase
-- IMPORTANTE: As tabelas estão no schema PUBLIC, não APP

-- ================================================================
-- 1. ADICIONAR COLUNA PASSWORD NA TABELA EMPLOYEES (SCHEMA PUBLIC)  
-- ================================================================

-- Adicionar coluna password se não existir
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Função para gerar senha inicial baseada na data de nascimento
CREATE OR REPLACE FUNCTION public.generate_initial_password_from_birthdate(birth_date DATE)
RETURNS VARCHAR(8) AS $$
BEGIN
    -- Converter data no formato DDMMAAAA (ex: 19/09/2004 -> 19092004)
    RETURN LPAD(EXTRACT(DAY FROM birth_date)::TEXT, 2, '0') || 
           LPAD(EXTRACT(MONTH FROM birth_date)::TEXT, 2, '0') || 
           EXTRACT(YEAR FROM birth_date)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Atualizar funcionários que não têm senha com a senha baseada na data de nascimento
UPDATE public.employees 
SET password = public.generate_initial_password_from_birthdate(birth_date::DATE)
WHERE password IS NULL AND birth_date IS NOT NULL;

-- ================================================================
-- 2. CRIAR TABELA PASSWORD_RESET_TOKENS (SCHEMA PUBLIC) - SIMPLES
-- ================================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id UUID REFERENCES public.managers(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar employee_id se não existir (para tabelas que já existem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens' 
        AND column_name = 'employee_id'
    ) THEN
        ALTER TABLE public.password_reset_tokens 
        ADD COLUMN employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens' 
        AND column_name = 'used_at'
    ) THEN
        ALTER TABLE public.password_reset_tokens 
        ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Tornar manager_id opcional
ALTER TABLE public.password_reset_tokens ALTER COLUMN manager_id DROP NOT NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON public.password_reset_tokens(expires_at);

-- ================================================================
-- 3. VERIFICAÇÃO FINAL
-- ================================================================

-- Mostrar status das tabelas
SELECT 
    'employees' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as com_senha,
    COUNT(CASE WHEN password IS NULL THEN 1 END) as sem_senha
FROM public.employees;

-- Mostrar dados específicos do funcionário teste
SELECT 
    name,
    cpf,
    birth_date,
    password,
    public.generate_initial_password_from_birthdate(birth_date::DATE) as senha_esperada
FROM public.employees 
WHERE cpf = '01932999680';