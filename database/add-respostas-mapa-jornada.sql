-- Adiciona o campo respostas_mapa_jornada na tabela employees
-- Este campo armazena o JSON completo das respostas do Typeform
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS respostas_mapa_jornada JSONB;

-- Adiciona comentário na coluna para documentação
COMMENT ON COLUMN employees.respostas_mapa_jornada IS 'JSON completo das respostas do formulário Typeform do mapa de jornada';

-- Criar índice para melhorar performance de queries JSON
CREATE INDEX IF NOT EXISTS idx_employees_respostas_jsonb ON employees USING GIN (respostas_mapa_jornada);