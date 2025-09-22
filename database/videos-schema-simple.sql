-- Script alternativo mais simples caso o CTE não funcione
-- Execute este SQL no Supabase Dashboard
-- 1. Adicionar colunas à tabela videos
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS created_by_type VARCHAR(20) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS created_by_id UUID,
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Verificar se a coluna created_by_type foi criada
ALTER TABLE videos ADD CONSTRAINT check_created_by_type CHECK (created_by_type IN ('system', 'company'));

-- 3. Atualizar vídeos existentes (método simples)
UPDATE videos
SET
    created_by_type = 'system'
WHERE
    created_by_type IS NULL;

-- 4. Atualizar display_order sequencialmente (método simples)
UPDATE videos
SET
    display_order = 1
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 2
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 3
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 4
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 5
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 6
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 7
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 8
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 9
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 10
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 11
WHERE
    created_by_type = 'system'
    AND display_order = 0;

UPDATE videos
SET
    display_order = 12
WHERE
    created_by_type = 'system'
    AND display_order = 0;

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_videos_company_id ON videos (company_id);

CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos (display_order);

CREATE INDEX IF NOT EXISTS idx_videos_created_by ON videos (created_by_type, created_by_id);

-- 6. Verificar resultado
SELECT
    id,
    title,
    created_by_type,
    display_order,
    created_at
FROM
    videos
ORDER BY
    display_order;