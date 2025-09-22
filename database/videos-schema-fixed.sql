-- Script corrigido para adicionar colunas e atualizar display_order
-- Execute este SQL no Supabase Dashboard
-- 1. Adicionar colunas à tabela videos
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS created_by_type VARCHAR(20) DEFAULT 'system' CHECK (created_by_type IN ('system', 'company')),
ADD COLUMN IF NOT EXISTS created_by_id UUID,
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Atualizar vídeos existentes como sendo do sistema (método corrigido)
WITH
    numbered_videos AS (
        SELECT
            id,
            ROW_NUMBER() OVER (
                ORDER BY
                    created_at
            ) as rn
        FROM
            videos
        WHERE
            created_by_type IS NULL
            OR display_order = 0
    )
UPDATE videos
SET
    created_by_type = 'system',
    display_order = numbered_videos.rn
FROM
    numbered_videos
WHERE
    videos.id = numbered_videos.id;

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_videos_company_id ON videos (company_id);

CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos (display_order);

CREATE INDEX IF NOT EXISTS idx_videos_created_by ON videos (created_by_type, created_by_id);

-- 4. Verificar resultado
SELECT
    id,
    title,
    created_by_type,
    display_order,
    created_at
FROM
    videos
ORDER BY
    display_order
LIMIT
    5;