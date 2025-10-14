-- Adicionar campo status na tabela managers
-- Este campo controla se o gestor está ativo ou inativo no sistema
-- Por padrão, novos gestores são criados como 'inactive' até que o pagamento seja confirmado

-- Adicionar coluna se não existir
ALTER TABLE app.managers 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'inactive';

-- Remover constraint antiga se existir e adicionar novamente
DO $$ 
BEGIN
    -- Tentar remover a constraint se ela existir
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'managers_status_check' 
        AND table_schema = 'app' 
        AND table_name = 'managers'
    ) THEN
        ALTER TABLE app.managers DROP CONSTRAINT managers_status_check;
    END IF;
    
    -- Adicionar constraint
    ALTER TABLE app.managers
    ADD CONSTRAINT managers_status_check 
    CHECK (status IN ('active', 'inactive'));
END $$;

-- Comentário explicativo
COMMENT ON COLUMN app.managers.status IS 'Status do gestor: active (pode acessar sistema) ou inactive (aguardando pagamento)';

-- Atualizar gestores existentes para 'active' se a empresa deles estiver ativa
UPDATE app.managers m
SET status = 'active'
FROM app.companies c
WHERE m.company_id = c.id 
AND c.status = 'active'
AND m.status = 'inactive';
