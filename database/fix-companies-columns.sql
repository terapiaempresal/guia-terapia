-- Script completo para atualizar a tabela companies com todas as colunas necessárias

-- 1. Adicionar coluna employees_quota
ALTER TABLE app.companies 
ADD COLUMN IF NOT EXISTS employees_quota int DEFAULT 5;

-- 2. Adicionar coluna plan
ALTER TABLE app.companies 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'equipe';

-- 3. Adicionar coluna status
ALTER TABLE app.companies 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'inactive';

-- 4. Atualizar valores NULL para os padrões
UPDATE app.companies 
SET employees_quota = 5 
WHERE employees_quota IS NULL;

UPDATE app.companies 
SET plan = 'equipe' 
WHERE plan IS NULL;

UPDATE app.companies 
SET status = 'inactive' 
WHERE status IS NULL;

-- 5. Tornar colunas NOT NULL
ALTER TABLE app.companies 
ALTER COLUMN employees_quota SET NOT NULL;

ALTER TABLE app.companies 
ALTER COLUMN plan SET NOT NULL;

ALTER TABLE app.companies 
ALTER COLUMN status SET NOT NULL;

-- 6. Adicionar constraints
DO $$ 
BEGIN
    -- Constraint para employees_quota
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'companies_employees_quota_check' 
        AND table_schema = 'app' AND table_name = 'companies'
    ) THEN
        ALTER TABLE app.companies
        ADD CONSTRAINT companies_employees_quota_check 
        CHECK (employees_quota >= 5);
    END IF;
    
    -- Constraint para status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'companies_status_check' 
        AND table_schema = 'app' AND table_name = 'companies'
    ) THEN
        ALTER TABLE app.companies
        ADD CONSTRAINT companies_status_check 
        CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- 7. Adicionar comentários
COMMENT ON COLUMN app.companies.employees_quota IS 'Número de funcionários permitidos (mínimo 5)';
COMMENT ON COLUMN app.companies.plan IS 'Plano contratado: equipe ou lider';
COMMENT ON COLUMN app.companies.status IS 'Status da empresa: active (pode usar sistema) ou inactive (aguardando ativação)';

-- 8. Verificar resultado
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'app' 
AND table_name = 'companies'
ORDER BY ordinal_position;
