-- Script para adicionar funcionalidade de Departamentos/Áreas de Atuação
-- 1. Criar tabela de departamentos
CREATE TABLE
    IF NOT EXISTS public.departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            updated_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            UNIQUE (company_id, name)
    );

-- 2. Criar tabela de relacionamento funcionário-departamento (many-to-many)
CREATE TABLE
    IF NOT EXISTS public.employee_departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        employee_id UUID NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
        department_id UUID NOT NULL REFERENCES public.departments (id) ON DELETE CASCADE,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            UNIQUE (employee_id, department_id)
    );

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments (company_id);

CREATE INDEX IF NOT EXISTS idx_employee_departments_employee_id ON public.employee_departments (employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_departments_department_id ON public.employee_departments (department_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de acesso
-- Departments: permitir leitura e escrita para usuários autenticados
CREATE POLICY "Permitir leitura de departamentos" ON public.departments FOR
SELECT
    USING (true);

CREATE POLICY "Permitir inserção de departamentos" ON public.departments FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Permitir atualização de departamentos" ON public.departments FOR
UPDATE USING (true);

CREATE POLICY "Permitir exclusão de departamentos" ON public.departments FOR DELETE USING (true);

-- Employee_departments: permitir leitura e escrita para usuários autenticados
CREATE POLICY "Permitir leitura de employee_departments" ON public.employee_departments FOR
SELECT
    USING (true);

CREATE POLICY "Permitir inserção de employee_departments" ON public.employee_departments FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Permitir atualização de employee_departments" ON public.employee_departments FOR
UPDATE USING (true);

CREATE POLICY "Permitir exclusão de employee_departments" ON public.employee_departments FOR DELETE USING (true);

-- 6. Inserir alguns departamentos de exemplo (opcional - comentado)
-- INSERT INTO public.departments (company_id, name, description) VALUES
-- ('COMPANY_ID_AQUI', 'Recursos Humanos', 'Gestão de pessoas e cultura'),
-- ('COMPANY_ID_AQUI', 'Financeiro', 'Controle financeiro e contabilidade'),
-- ('COMPANY_ID_AQUI', 'Comercial', 'Vendas e relacionamento com clientes'),
-- ('COMPANY_ID_AQUI', 'Operações', 'Processos operacionais'),
-- ('COMPANY_ID_AQUI', 'TI', 'Tecnologia da Informação'),
-- ('COMPANY_ID_AQUI', 'Marketing', 'Marketing e comunicação');
-- 7. Verificar estrutura
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name IN ('departments', 'employee_departments')
ORDER BY
    table_name,
    ordinal_position;

-- 8. Verificar dados (após inserir)
-- SELECT 
--     d.id,
--     d.name,
--     d.description,
--     c.name as company_name,
--     d.created_at
-- FROM 
--     public.departments d
--     LEFT JOIN public.companies c ON c.id = d.company_id
-- ORDER BY 
--     c.name, d.name;