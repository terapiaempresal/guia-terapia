-- ========================================
-- ADICIONAR TODAS AS COLUNAS FALTANTES
-- ========================================
-- 1. TABELA COMPANIES - Adicionar colunas
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS employees_quota integer DEFAULT 5 CHECK (employees_quota >= 5);

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'equipe';

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive'));

-- 2. TABELA MANAGERS - Adicionar colunas
ALTER TABLE public.managers
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

ALTER TABLE public.managers
ADD COLUMN IF NOT EXISTS full_name text;

ALTER TABLE public.managers
ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.managers
ADD COLUMN IF NOT EXISTS status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive'));

-- 3. Migrar dados existentes de managers
UPDATE public.managers
SET
    full_name = name
WHERE
    full_name IS NULL
    AND name IS NOT NULL;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_managers_auth_user_id ON public.managers (auth_user_id);

CREATE INDEX IF NOT EXISTS idx_managers_company_id ON public.managers (company_id);

CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies (status);

CREATE INDEX IF NOT EXISTS idx_managers_status ON public.managers (status);

-- 5. Recarregar cache do PostgREST
NOTIFY pgrst,
'reload schema';

NOTIFY pgrst,
'reload config';

-- 6. Verificar resultado
SELECT
    'companies' as tabela,
    column_name,
    data_type,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'companies'
UNION ALL
SELECT
    'managers' as tabela,
    column_name,
    data_type,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'managers'
ORDER BY
    tabela,
    column_name;