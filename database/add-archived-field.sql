-- Adicionar campo 'archived' na tabela employees para implementar arquivamento
-- Em vez de excluir funcionários, eles serão arquivados mantendo acesso ao portal
-- Adicionar campo archived (default false = não arquivado)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Adicionar campo archived_at para rastrear quando foi arquivado
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP
WITH
    TIME ZONE;

-- Criar índice para otimizar consultas de funcionários não arquivados
CREATE INDEX IF NOT EXISTS employees_archived_idx ON public.employees (archived)
WHERE
    archived = FALSE;

-- Comentários
COMMENT ON COLUMN public.employees.archived IS 'Indica se o funcionário foi arquivado (soft delete)';

COMMENT ON COLUMN public.employees.archived_at IS 'Timestamp de quando o funcionário foi arquivado';