# Webhook Typeform - Mapa de Jornada

## Resumo da Implementação

Esta implementação permite que as respostas do formulário Typeform sejam automaticamente salvas no banco de dados quando um funcionário preenche o mapa de jornada, e também permite regenerar o mapa HTML a partir das respostas salvas.

## 📋 O que foi implementado

### 1. Campo no Banco de Dados

- **Coluna**: `respostas_mapa_jornada` (JSONB)
- **Tabela**: `employees`
- **Migração**: `database/add-respostas-mapa-jornada.sql`

### 2. API Webhook para Typeform

- **Endpoint**: `/api/webhooks/typeform-mapa`
- **Método**: POST
- **Função**: Recebe as respostas do Typeform e salva no banco

### 3. API para Regenerar Mapa

- **Endpoint**: `/api/employees/regenerate-map`
- **Método**: POST
- **Função**: Busca as respostas salvas e envia para regeneração

### 4. Interface Admin

- **Botão**: "Recarregar Mapa" (roxo)
- **Localização**: Painel Admin > Detalhes da Empresa > Funcionários
- **Funcionalidade**: Regenera o mapa HTML a partir das respostas salvas

## 🚀 Como Configurar

### Passo 1: Executar a Migração SQL

Execute no Supabase SQL Editor:

\`\`\`sql
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS respostas_mapa_jornada JSONB;

CREATE INDEX IF NOT EXISTS idx_employees_respostas_jsonb
ON employees USING GIN (respostas_mapa_jornada);
\`\`\`

### Passo 2: Configurar Webhook no Typeform

1. Acesse seu formulário no Typeform
2. Vá em **Connect > Webhooks**
3. Adicione um novo webhook com a URL:

   ```
   https://seu-dominio.com/api/webhooks/typeform-mapa
   ```

### Passo 3: Configurar Webhook Externo

Configure o webhook `https://webhook.terapiaempresarial.com.br/webhook/mapa-terapia` para:

- Receber o JSON das respostas
- Gerar o HTML do mapa
- Retornar o HTML gerado

## 📊 Fluxo de Dados

### Fluxo Inicial (Preenchimento do Typeform)

\`\`\`
Funcionário preenche Typeform
         ↓
Typeform envia webhook → /api/webhooks/typeform-mapa
         ↓
Sistema identifica funcionário (por email ou CPF)
         ↓
JSON completo salvo em respostas_mapa_jornada
         ↓
journey_filled = true
\`\`\`

### Fluxo de Regeneração (Admin)

\`\`\`
Admin clica em "Recarregar Mapa"
         ↓
/api/employees/regenerate-map busca respostas salvas
         ↓
Envia para webhook externo: webhook.terapiaempresarial.com.br
         ↓
Webhook externo processa e gera HTML
         ↓
HTML salvo em journey_result_html
         ↓
Interface admin atualizada
\`\`\`

## 🔍 Exemplo de Dados

### JSON Recebido do Typeform

\`\`\`json
{
  "email": "<funcionario@empresa.com>",
  "CPF": "12345678900",
  "nome": "Nome do Funcionário",
  "submittedAt": "2025-11-10T16:50:55.749Z",
  "1": "Paciente",
  "2": "Leal",
  "3": "Competitivo",
  "Consentimento LGPD": "Li, entendi e concordo...",
  "Minha confiança em mim.": "10",
  "Empresa": "Nome da Empresa",
  // ... todas as outras respostas
}
\`\`\`

### Resposta do Webhook

\`\`\`json
{
  "success": true,
  "message": "Respostas do mapa de jornada salvas com sucesso",
  "employee_id": "uuid-do-funcionario",
  "employee_name": "Nome do Funcionário",
  "saved_at": "2025-11-10T16:55:00.000Z",
  "data": { /*JSON completo das respostas*/ }
}
\`\`\`

## 🎨 Interface Admin

### Badge Indicativo

- Quando o funcionário tem `respostas_mapa_jornada`, o botão "Recarregar Mapa" fica visível

### Botões Disponíveis

1. **Ver Mapa** (azul) - Exibe/oculta o mapa HTML
2. **Marcar para Revisão** (amarelo) - Marca/desmarca como em revisão
3. **Recarregar Mapa** (roxo) - Regenera o mapa a partir das respostas salvas
4. **Editar HTML** (laranja) - Permite editar o HTML manualmente

## 🔐 Segurança

### Identificação do Funcionário
O sistema identifica o funcionário por:

1. **Email** (prioridade)
2. **CPF** (fallback)

### Validações

- ✅ Verifica se email ou CPF foi fornecido
- ✅ Busca o funcionário no banco
- ✅ Retorna erro 404 se não encontrado
- ✅ Logs detalhados de todo o processo

## 🐛 Troubleshooting

### Funcionário não encontrado

- Verifique se o email no Typeform está exatamente igual ao cadastrado
- Verifique se o CPF está sem pontos e traços
- Confira os logs no console: `[Webhook Typeform]`

### Botão "Recarregar Mapa" não aparece

- O funcionário precisa ter `respostas_mapa_jornada` preenchido
- Verifique no Supabase se a coluna existe e tem dados

### Erro ao regenerar

- Verifique se o webhook externo está respondendo
- Confira a URL do webhook em `regenerateMap()`
- Veja os logs do navegador (F12 > Console)

## 📝 Notas Importantes

1. **Campos obrigatórios no Typeform**: `email` ou `CPF`
2. **Formato do CPF**: Apenas números (pontos e traços são removidos automaticamente)
3. **Webhook externo**: Deve estar configurado para receber e retornar JSON
4. **Índice GIN**: Criado para melhorar performance de queries no JSONB

## 🔄 Atualizações Futuras

Possíveis melhorias:

- [ ] Adicionar histórico de regenerações
- [ ] Comparar versões do mapa (diff)
- [ ] Notificar funcionário quando mapa for regenerado
- [ ] Adicionar validação de schema do JSON
- [ ] Cache das respostas para regeneração mais rápida
