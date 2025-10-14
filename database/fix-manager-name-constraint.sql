-- Corrigir constraint NOT NULL da coluna name em managers

-- 1. Tornar a coluna 'name' NULLABLE (para permitir usar só full_name)
ALTER TABLE public.managers 
ALTER COLUMN name DROP NOT NULL;

-- 2. OU: Criar trigger para sincronizar name = full_name
CREATE OR REPLACE FUNCTION sync_manager_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Se full_name está definido mas name não, copiar
    IF NEW.full_name IS NOT NULL AND NEW.name IS NULL THEN
        NEW.name := NEW.full_name;
    END IF;
    
    -- Se name está definido mas full_name não, copiar
    IF NEW.name IS NOT NULL AND NEW.full_name IS NULL THEN
        NEW.full_name := NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_sync_manager_name ON public.managers;
CREATE TRIGGER trigger_sync_manager_name
    BEFORE INSERT OR UPDATE ON public.managers
    FOR EACH ROW
    EXECUTE FUNCTION sync_manager_name();

-- 3. Atualizar registros existentes que só têm name
UPDATE public.managers 
SET full_name = name 
WHERE full_name IS NULL AND name IS NOT NULL;

-- 4. Atualizar registros existentes que só têm full_name
UPDATE public.managers 
SET name = full_name 
WHERE name IS NULL AND full_name IS NOT NULL;

-- 5. Recarregar cache
NOTIFY pgrst, 'reload schema';

-- 6. Verificar
SELECT id, name, full_name, email FROM public.managers LIMIT 5;
