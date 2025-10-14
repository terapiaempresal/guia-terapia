-- Adicionar coluna is_admin na tabela managers
-- 1. Adicionar coluna
ALTER TABLE public.managers
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Tornar alguns gestores admin (por email)
UPDATE public.managers
SET
    is_admin = true
WHERE
    email = 'lucashlc.contato@gmail.com';

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_managers_is_admin ON public.managers (is_admin);

-- 4. Verificar resultado
SELECT
    full_name,
    email,
    is_admin,
    status
FROM
    public.managers
WHERE
    is_admin = true;

-- 5. Ver todos os gestores com flag de admin
SELECT
    m.full_name,
    m.email,
    m.is_admin,
    m.status,
    c.name as empresa
FROM
    public.managers m
    LEFT JOIN public.companies c ON c.id = m.company_id
ORDER BY
    m.is_admin DESC,
    m.created_at DESC;