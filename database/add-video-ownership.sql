-- Script para adicionar controle de propriedade dos vídeos
-- Permite identificar quais vídeos pertencem ao sistema vs quais foram criados por gestores

-- Adicionar colunas para controle de propriedade
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS created_by_type VARCHAR DEFAULT 'system', -- 'system' ou 'manager'
ADD COLUMN IF NOT EXISTS created_by_id UUID, -- ID do gestor quando created_by_type = 'manager'
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.managers(id), -- Para facilitar consultas
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id), -- Qual empresa pode ver este vídeo
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0; -- Ordem de exibição

-- Comentários para documentação
COMMENT ON COLUMN public.videos.created_by_type IS 'Tipo do criador: system (vídeos padrão) ou manager (vídeos do gestor)';
COMMENT ON COLUMN public.videos.created_by_id IS 'ID do gestor que criou o vídeo (quando created_by_type = manager)';
COMMENT ON COLUMN public.videos.manager_id IS 'ID do gestor responsável (cópia para facilitar consultas)';
COMMENT ON COLUMN public.videos.company_id IS 'ID da empresa que pode visualizar este vídeo';
COMMENT ON COLUMN public.videos.display_order IS 'Ordem de exibição dos vídeos (menor primeiro)';

-- Atualizar vídeos existentes como sendo do sistema
UPDATE public.videos 
SET created_by_type = 'system',
    display_order = CASE 
        WHEN title ILIKE '%introdução%' OR title ILIKE '%intro%' THEN 1
        WHEN title ILIKE '%básico%' OR title ILIKE '%fundamento%' THEN 2
        WHEN title ILIKE '%avançado%' OR title ILIKE '%expert%' THEN 10
        ELSE 5
    END
WHERE created_by_type IS NULL OR created_by_type = 'system';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_videos_created_by_type ON public.videos(created_by_type);
CREATE INDEX IF NOT EXISTS idx_videos_manager_id ON public.videos(manager_id);
CREATE INDEX IF NOT EXISTS idx_videos_company_id ON public.videos(company_id);
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON public.videos(display_order);

-- Atualizar políticas RLS para considerar a propriedade
DROP POLICY IF EXISTS "Videos are viewable by managers" ON public.videos;
CREATE POLICY "Videos are viewable by managers" ON public.videos FOR SELECT
USING (
    created_by_type = 'system' OR  -- Vídeos do sistema são visíveis para todos
    (created_by_type = 'manager' AND manager_id = auth.uid()::uuid) -- Vídeos do gestor são visíveis apenas para ele
);

DROP POLICY IF EXISTS "Videos are editable by managers" ON public.videos;
CREATE POLICY "Videos are editable by managers" ON public.videos FOR UPDATE
USING (
    created_by_type = 'manager' AND manager_id = auth.uid()::uuid -- Apenas o gestor pode editar seus próprios vídeos
);

DROP POLICY IF EXISTS "Videos are deletable by managers" ON public.videos;
CREATE POLICY "Videos are deletable by managers" ON public.videos FOR DELETE
USING (
    created_by_type = 'manager' AND manager_id = auth.uid()::uuid -- Apenas o gestor pode excluir seus próprios vídeos
);