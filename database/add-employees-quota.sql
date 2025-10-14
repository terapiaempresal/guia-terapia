-- Adicionar coluna employees_quota na tabela companies se não existir
-- Esta coluna armazena o número de funcionários permitidos para a empresa

ALTER TABLE app.companies 
ADD COLUMN IF NOT EXISTS employees_quota int;

-- Adicionar constraint para garantir mínimo de 5
DO $$ 
BEGIN
    -- Tentar remover a constraint se ela existir
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'companies_employees_quota_check' 
        AND table_schema = 'app' 
        AND table_name = 'companies'
    ) THEN
        ALTER TABLE app.companies DROP CONSTRAINT companies_employees_quota_check;
    END IF;
    
    -- Adicionar constraint
    ALTER TABLE app.companies
    ADD CONSTRAINT companies_employees_quota_check 
    CHECK (employees_quota IS NULL OR employees_quota >= 5);
END $$;

-- Definir valor padrão para empresas existentes sem quota
UPDATE app.companies 
SET employees_quota = 5 
WHERE employees_quota IS NULL;

-- Tornar a coluna NOT NULL após atualizar os valores
ALTER TABLE app.companies 
ALTER COLUMN employees_quota SET NOT NULL;

-- Definir valor padrão para novas empresas
ALTER TABLE app.companies 
ALTER COLUMN employees_quota SET DEFAULT 5;

-- Comentário explicativo
COMMENT ON COLUMN app.companies.employees_quota IS 'Número de funcionários permitidos (mínimo 5)';
