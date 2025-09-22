-- Criar tabela para armazenar respostas do Caderno de Clareza e Carreira dos funcionários
CREATE TABLE IF NOT EXISTS employee_workbook_responses (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL,
    section VARCHAR(100) NOT NULL, -- Ex: 'capsula_tempo', 'roda_vida_1', 'swot_1', etc.
    field_key VARCHAR(100) NOT NULL, -- Identificador único do campo 
    field_label TEXT NOT NULL, -- Texto da pergunta/label do campo
    field_type VARCHAR(20) NOT NULL DEFAULT 'textarea', -- 'textarea', 'input', 'number'
    value TEXT, -- Valor da resposta do funcionário
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para garantir que cada funcionário tenha uma resposta única por campo
    UNIQUE(employee_id, field_key),
    
    -- Foreign key para employees
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_employee_workbook_responses_employee_id 
ON employee_workbook_responses(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_workbook_responses_section 
ON employee_workbook_responses(section);

CREATE INDEX IF NOT EXISTS idx_employee_workbook_responses_field_key 
ON employee_workbook_responses(field_key);

-- Criar função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_employee_workbook_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_employee_workbook_responses_updated_at ON employee_workbook_responses;
CREATE TRIGGER trigger_update_employee_workbook_responses_updated_at
    BEFORE UPDATE ON employee_workbook_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_workbook_responses_updated_at();

-- Comentários explicativos
COMMENT ON TABLE employee_workbook_responses IS 'Armazena as respostas dos funcionários ao Caderno de Clareza e Carreira';
COMMENT ON COLUMN employee_workbook_responses.employee_id IS 'ID do funcionário que respondeu';
COMMENT ON COLUMN employee_workbook_responses.section IS 'Seção do caderno (capsula_tempo, roda_vida, swot, etc.)';
COMMENT ON COLUMN employee_workbook_responses.field_key IS 'Chave única do campo para identificação';
COMMENT ON COLUMN employee_workbook_responses.field_label IS 'Texto da pergunta/label original';
COMMENT ON COLUMN employee_workbook_responses.field_type IS 'Tipo do campo (textarea, input, number)';
COMMENT ON COLUMN employee_workbook_responses.value IS 'Resposta do funcionário';