# Guia de Teste - Funcionalidade de Arquivar Colaborador

## ✅ Funcionalidades Implementadas

### 1. **Arquivamento ao invés de Exclusão**

- Botão "Remover" foi alterado para "Arquivar" (cor laranja)
- Modal de confirmação atualizado para "Arquivar Funcionário"
- Funcionários são marcados como `archived = true` ao invés de serem deletados fisicamente

### 2. **Filtros e Visualização**

- Lista principal mostra apenas funcionários não arquivados (`archived = false`)
- Botão "Ver Arquivados" para alternar visualização
- Funcionários arquivados mostram badge "Arquivado" e data de arquivamento

### 3. **Preservação de Acesso**

- API de login não filtra por arquivados
- Funcionários arquivados mantêm acesso completo ao portal
- Histórico e progresso são preservados

## 🧪 Plano de Teste

### Pré-requisitos

1. ✅ Executar script SQL para adicionar campos `archived` e `archived_at`:

   ```sql
   -- Ver arquivo: database/add-archived-field.sql
   ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
   ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
   CREATE INDEX IF NOT EXISTS employees_archived_idx ON public.employees(archived) WHERE archived = FALSE;
   ```

2. ✅ Servidor rodando em <http://localhost:3000>

### Testes a Realizar

#### Teste 1: Arquivar Funcionário

1. Acesse o painel do gestor: <http://localhost:3000/gestor>
2. Visualize a lista de funcionários ativos
3. Clique no botão "Arquivar" (laranja) de um funcionário
4. Confirme no modal "Arquivar Funcionário"
5. ✅ **Resultado esperado**: Funcionário desaparece da lista principal

#### Teste 2: Visualizar Arquivados

1. No painel do gestor, clique em "Ver Arquivados"
2. ✅ **Resultado esperado**:
   - Lista muda para "Funcionários Arquivados"
   - Funcionário arquivado aparece com badge "Arquivado"
   - Mostra data de arquivamento
   - Botão "Ocultar Arquivados" para voltar

#### Teste 3: Acesso do Funcionário Arquivado

1. Com funcionário arquivado, acesse o portal do funcionário
2. Use as credenciais do funcionário arquivado
3. ✅ **Resultado esperado**:
   - Login funciona normalmente
   - Acesso completo ao portal (vídeos, mapa, ferramentas)
   - Progresso preservado

#### Teste 4: Contagem de Métricas

1. Verifique as métricas no painel:
   - "Funcionários Totais" deve mostrar apenas não arquivados
   - "Taxa de Conclusão" deve calcular apenas não arquivados
2. ✅ **Resultado esperado**: Métricas não incluem arquivados

## 🔍 Pontos de Verificação

### ✅ API Endpoints

- `GET /api/employees` - Filtra `archived = false`
- `DELETE /api/employees` - Faz soft delete (update)
- `GET /api/employees/archived` - Lista arquivados
- `POST /api/employees/login` - Não filtra arquivados

### ✅ Interface do Gestor

- Botão "Arquivar" (laranja) ao invés de "Remover" (vermelho)
- Toggle "Ver Arquivados" / "Ocultar Arquivados"
- Modal de confirmação atualizado
- Badge visual para funcionários arquivados

### ✅ Banco de Dados

- Campo `archived` (boolean, default false)
- Campo `archived_at` (timestamp)
- Índice otimizado para consultas

## 🚧 Próximos Passos (Opcionais)

1. **Funcionalidade de Desarquivar**
   - Botão para reativar funcionário arquivado
   - Endpoint já criado: `POST /api/employees/archived`

2. **Relatórios Separados**
   - Dashboard específico para funcionários arquivados
   - Métricas históricas incluindo arquivados

3. **Notificações**
   - Email para funcionário informando arquivamento
   - Log de auditoria para ações de arquivamento

## ⚠️ Importante

- **NÃO** execute exclusões diretas no banco após implementar
- Funcionários arquivados **MANTÊM** acesso total ao portal
- Use "Ver Arquivados" para gerenciar funcionários antigos
- Para testes, sempre use o botão "Arquivar" da interface
