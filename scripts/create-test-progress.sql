-- Inserir alguns vídeos de exemplo para testar o progresso
INSERT INTO
    public.videos (
        id,
        title,
        description,
        video_url,
        duration,
        category
    )
VALUES
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Introdução ao Curso',
        'Primeiro vídeo do curso',
        'https://example.com/video1',
        300,
        'introducao'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Conceitos Básicos',
        'Segundo vídeo do curso',
        'https://example.com/video2',
        450,
        'basico'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003',
        'Práticas Avançadas',
        'Terceiro vídeo do curso',
        'https://example.com/video3',
        600,
        'avancado'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440004',
        'Estudos de Caso',
        'Quarto vídeo do curso',
        'https://example.com/video4',
        500,
        'casos'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440005',
        'Conclusão',
        'Quinto vídeo do curso',
        'https://example.com/video5',
        200,
        'conclusao'
    ) ON CONFLICT (id) DO NOTHING;

-- Inserir progresso para a funcionária Maria Silva
INSERT INTO
    public.employee_progress (
        employee_id,
        video_id,
        watched_duration,
        completed,
        completed_at
    )
VALUES
    (
        '60945cb2-6903-482e-9eab-c584619bcc27',
        '550e8400-e29b-41d4-a716-446655440001',
        300,
        true,
        NOW ()
    ),
    (
        '60945cb2-6903-482e-9eab-c584619bcc27',
        '550e8400-e29b-41d4-a716-446655440002',
        450,
        true,
        NOW ()
    ),
    (
        '60945cb2-6903-482e-9eab-c584619bcc27',
        '550e8400-e29b-41d4-a716-446655440003',
        300,
        false,
        NULL
    ) ON CONFLICT (employee_id, video_id) DO NOTHING;