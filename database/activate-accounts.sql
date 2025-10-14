-- ========================================
-- SCRIPT DE ATIVAÇÃO DE GESTORES
-- ========================================

-- ============================================================
-- 1. VISUALIZAR EMPRESAS INATIVAS
-- ============================================================

-- Ver lista de empresas inativas
SELECT 
  ROW_NUMBER() OVER (ORDER BY created_at DESC) as num,
  id,
  name,
  status,
  employees_quota,
  plan,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as cadastrado_em
FROM public.companies
WHERE status = 'inactive'
ORDER BY created_at DESC;

-- ============================================================
-- 2. VISUALIZAR GESTORES INATIVOS
-- ============================================================

-- Ver gestores inativos com suas empresas
SELECT 
  ROW_NUMBER() OVER (ORDER BY m.created_at DESC) as num,
  m.full_name as gestor,
  m.email,
  m.phone,
  c.name as empresa,
  m.status as gestor_status,
  c.status as empresa_status,
  TO_CHAR(m.created_at, 'DD/MM/YYYY HH24:MI') as cadastrado_em
FROM public.managers m
JOIN public.companies c ON c.id = m.company_id
WHERE m.status = 'inactive'
ORDER BY m.created_at DESC;

-- ============================================================
-- 3. ATIVAR EMPRESA ESPECÍFICA POR NOME
-- ============================================================

-- ⚠️  EDITE O NOME DA EMPRESA AQUI:
UPDATE public.companies 
SET status = 'active' 
WHERE name = 'Lucas Company'; -- ← Altere o nome aqui

-- ============================================================
-- 4. ATIVAR TODOS OS GESTORES DA EMPRESA
-- ============================================================

-- ⚠️  EDITE O NOME DA EMPRESA AQUI:
UPDATE public.managers 
SET status = 'active' 
WHERE company_id = (
  SELECT id 
  FROM public.companies 
  WHERE name = 'Lucas Company' -- ← Altere o nome aqui
);

-- ============================================================
-- 5. ATIVAR EMPRESA + GESTORES (SOLUÇÃO COMPLETA)
-- ============================================================

-- ⚠️  EDITE O NOME DA EMPRESA AQUI:
DO $$
DECLARE
  empresa_id uuid;
  empresa_nome text := 'Lucas Company'; -- ← Altere o nome aqui
  gestores_count int;
BEGIN
  -- Verificar se empresa existe
  SELECT id INTO empresa_id
  FROM public.companies
  WHERE name = empresa_nome;
  
  IF empresa_id IS NULL THEN
    RAISE EXCEPTION 'Empresa "%" não encontrada!', empresa_nome;
  END IF;
  
  -- Ativar empresa
  UPDATE public.companies 
  SET status = 'active' 
  WHERE id = empresa_id;
  
  -- Ativar gestores
  UPDATE public.managers 
  SET status = 'active' 
  WHERE company_id = empresa_id;
  
  -- Contar gestores ativados
  SELECT COUNT(*) INTO gestores_count
  FROM public.managers
  WHERE company_id = empresa_id;
  
  RAISE NOTICE '✅ Empresa "%" ativada!', empresa_nome;
  RAISE NOTICE '✅ % gestor(es) ativado(s)!', gestores_count;
END $$;

-- ============================================================
-- 6. ATIVAR POR EMAIL DO GESTOR
-- ============================================================

-- ⚠️  EDITE O EMAIL DO GESTOR AQUI:
DO $$
DECLARE
  gestor_email text := 'lucashlc.contato@gmail.com'; -- ← Altere o email aqui
  empresa_id uuid;
  empresa_nome text;
BEGIN
  -- Buscar empresa do gestor
  SELECT c.id, c.name INTO empresa_id, empresa_nome
  FROM public.managers m
  JOIN public.companies c ON c.id = m.company_id
  WHERE m.email = gestor_email;
  
  IF empresa_id IS NULL THEN
    RAISE EXCEPTION 'Gestor com email "%" não encontrado!', gestor_email;
  END IF;
  
  -- Ativar empresa
  UPDATE public.companies 
  SET status = 'active' 
  WHERE id = empresa_id;
  
  -- Ativar TODOS os gestores da empresa
  UPDATE public.managers 
  SET status = 'active' 
  WHERE company_id = empresa_id;
  
  RAISE NOTICE '✅ Empresa "%" ativada!', empresa_nome;
  RAISE NOTICE '✅ Gestor "%" pode fazer login!', gestor_email;
END $$;

-- ============================================================
-- 7. ATIVAR MÚLTIPLAS EMPRESAS POR PADRÃO NO NOME
-- ============================================================

-- Ativar todas as empresas que começam com "Lucas"
UPDATE public.companies 
SET status = 'active' 
WHERE name LIKE 'Lucas%' 
  AND status = 'inactive';

-- Ativar gestores dessas empresas
UPDATE public.managers 
SET status = 'active' 
WHERE company_id IN (
  SELECT id 
  FROM public.companies 
  WHERE name LIKE 'Lucas%'
)
AND status = 'inactive';

-- ============================================================
-- 8. ATIVAR EMPRESAS ANTIGAS (MAIS DE 7 DIAS)
-- ============================================================

-- Ativar empresas criadas há mais de 7 dias que ainda estão inativas
UPDATE public.companies 
SET status = 'active' 
WHERE status = 'inactive' 
  AND created_at < NOW() - INTERVAL '7 days';

-- Ativar gestores dessas empresas
UPDATE public.managers 
SET status = 'active' 
WHERE status = 'inactive'
  AND created_at < NOW() - INTERVAL '7 days';

-- ============================================================
-- 9. ATIVAR TODAS (CUIDADO!)
-- ============================================================

-- ⚠️  ATENÇÃO: Isso ativa TODAS as empresas e gestores inativos!
-- Descomente apenas se tiver certeza:

-- UPDATE public.companies SET status = 'active' WHERE status = 'inactive';
-- UPDATE public.managers SET status = 'active' WHERE status = 'inactive';

-- ============================================================
-- 10. VERIFICAR RESULTADO
-- ============================================================

-- Verificar empresas ativas vs inativas
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM public.companies
GROUP BY status;

-- Verificar gestores ativos vs inativos
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM public.managers
GROUP BY status;

-- Ver detalhes de uma empresa específica
SELECT 
  c.name as empresa,
  c.status as empresa_status,
  c.employees_quota,
  c.plan,
  m.full_name as gestor,
  m.email,
  m.phone,
  m.status as gestor_status,
  TO_CHAR(c.created_at, 'DD/MM/YYYY') as empresa_criada_em,
  TO_CHAR(m.created_at, 'DD/MM/YYYY') as gestor_criado_em
FROM public.companies c
LEFT JOIN public.managers m ON m.company_id = c.id
WHERE c.name = 'Lucas Company' -- ← Altere o nome aqui
ORDER BY m.created_at;

-- ============================================================
-- 11. DESATIVAR (SE NECESSÁRIO)
-- ============================================================

-- Desativar empresa específica
-- UPDATE public.companies SET status = 'inactive' WHERE name = 'Nome da Empresa';

-- Desativar gestores de uma empresa
-- UPDATE public.managers SET status = 'inactive' 
-- WHERE company_id = (SELECT id FROM public.companies WHERE name = 'Nome da Empresa');

-- ========================================
-- FIM DO SCRIPT
-- ========================================
