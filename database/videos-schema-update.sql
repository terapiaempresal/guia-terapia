-- Atualizar esquema do banco para suportar vídeos personalizados
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar colunas necessárias à tabela videos se não existirem
DO $$
BEGIN
    -- Verificar se a coluna is_active existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'is_active') THEN
        ALTER TABLE public.videos ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Verificar se a coluna created_by existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'created_by') THEN
        ALTER TABLE public.videos ADD COLUMN created_by UUID;
    END IF;

    -- Verificar se a coluna youtube_video_id existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'youtube_video_id') THEN
        ALTER TABLE public.videos ADD COLUMN youtube_video_id VARCHAR;
    END IF;

    -- Verificar se a coluna video_type existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'video_type') THEN
        ALTER TABLE public.videos ADD COLUMN video_type VARCHAR DEFAULT 'custom';
    END IF;
END $$;

-- 2. Criar tabela de atribuições de vídeos se não existir
CREATE TABLE IF NOT EXISTS public.video_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID, -- ID do gestor que atribuiu
    status VARCHAR DEFAULT 'pending', -- 'pending', 'watched', 'in_progress'
    watched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, employee_id) -- Evitar atribuições duplicadas
);

-- 3. Habilitar RLS nas novas estruturas
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS básicas (permissivas para desenvolvimento)
DROP POLICY IF EXISTS "video_assignments_all_access" ON public.video_assignments;
CREATE POLICY "video_assignments_all_access" ON public.video_assignments
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "videos_all_access" ON public.videos;
CREATE POLICY "videos_all_access" ON public.videos
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_video_assignments_video_id ON public.video_assignments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_assignments_employee_id ON public.video_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON public.videos(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_video_type ON public.videos(video_type);

-- 6. Comentários para documentação
COMMENT ON TABLE public.video_assignments IS 'Atribuições de vídeos a funcionários';
COMMENT ON COLUMN public.videos.video_type IS 'Tipo de vídeo: default (original), custom (adicionado pelo gestor)';
COMMENT ON COLUMN public.videos.youtube_video_id IS 'ID do vídeo no YouTube para vídeos externos';
COMMENT ON COLUMN public.videos.is_active IS 'Se o vídeo está ativo e visível';