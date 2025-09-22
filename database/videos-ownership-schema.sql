-- Adicionar colunas para controle de propriedade e ordenação dos vídeos
-- Executar este script no Supabase
-- Adicionar colunas à tabela videos
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS created_by_type VARCHAR(20) DEFAULT 'system' CHECK (created_by_type IN ('system', 'company')),
ADD COLUMN IF NOT EXISTS created_by_id UUID, -- manager_id para vídeos da empresa
ADD COLUMN IF NOT EXISTS company_id UUID, -- empresa proprietária do vídeo  
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Atualizar vídeos existentes como sendo do sistema
UPDATE videos
SET
    created_by_type = 'system',
    display_order = ROW_NUMBER() OVER (
        ORDER BY
            created_at
    )
WHERE
    created_by_type IS NULL
    OR created_by_type = 'system';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_videos_company_id ON videos (company_id);

CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos (display_order);

CREATE INDEX IF NOT EXISTS idx_videos_created_by ON videos (created_by_type, created_by_id);

-- Comentários para documentação
COMMENT ON COLUMN videos.created_by_type IS 'Tipo de criador: system (vídeos padrão) ou company (vídeos da empresa)';

COMMENT ON COLUMN videos.created_by_id IS 'ID do manager que criou o vídeo (apenas para created_by_type=company)';

COMMENT ON COLUMN videos.company_id IS 'ID da empresa proprietária do vídeo (NULL para vídeos do sistema)';

COMMENT ON COLUMN videos.display_order IS 'Ordem de exibição dos vídeos (drag and drop)';

-- Adicionar constraint para garantir consistência
ALTER TABLE videos ADD CONSTRAINT check_company_videos_consistency CHECK (
    (
        created_by_type = 'system'
        AND created_by_id IS NULL
        AND company_id IS NULL
    )
    OR (
        created_by_type = 'company'
        AND created_by_id IS NOT NULL
        AND company_id IS NOT NULL
    )
);