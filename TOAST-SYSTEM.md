# Sistema de Toast - Guia de Terapia

Este documento explica como usar o sistema de notificações toast implementado na aplicação.

## Visão Geral

Substituímos todos os `alert()` por um sistema de toast elegante e moderno que oferece melhor experiência do usuário com animações suaves e diferentes tipos de notificação.

## Componentes

### 1. Toast (`src/components/Toast.tsx`)
Componente individual que renderiza uma notificação toast com:

- Ícones baseados no tipo (sucesso, erro, aviso, info)
- Cores temáticas para cada tipo
- Animações de entrada e saída
- Botão de fechar
- Auto-remoção após 5 segundos (configurável)

### 2. ToastProvider (`src/components/ToastProvider.tsx`)
Provider que gerencia o estado global dos toasts e fornece funções para criar notificações.

## Como Usar

### 1. Configuração (já implementada)
O `ToastProvider` está envolvendo toda a aplicação no `layout.tsx`:

```tsx
import ToastProvider from '@/components/ToastProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

### 2. Usando em Componentes

```tsx
import { useToast } from '@/components/ToastProvider'

export default function MeuComponente() {
  const { showSuccess, showError, showWarning, showInfo } = useToast()

  const handleAction = () => {
    // Substituir: alert('Sucesso!')
    // Por:
    showSuccess('Operação realizada com sucesso!')
    
    // Ou com título:
    showSuccess('Dados salvos com sucesso!', 'Sucesso')
    
    // Para erros:
    showError('Erro ao processar dados')
    
    // Para avisos:
    showWarning('Preencha todos os campos obrigatórios')
    
    // Para informações:
    showInfo('Processando solicitação...')
  }
}
```

### 3. Método Genérico

```tsx
const { showToast } = useToast()

// Controle total sobre a notificação
showToast('Mensagem personalizada', 'success', 'Título Opcional', 3000)
```

## Tipos de Toast

### 🟢 Success (Sucesso)

- **Cor**: Verde
- **Uso**: Operações bem-sucedidas, confirmações
- **Exemplo**: "Funcionário adicionado com sucesso!"

### 🔴 Error (Erro)

- **Cor**: Vermelho
- **Uso**: Erros, falhas de sistema
- **Exemplo**: "Erro ao conectar com o servidor"

### 🟡 Warning (Aviso)

- **Cor**: Amarelo
- **Uso**: Validações, campos obrigatórios
- **Exemplo**: "Por favor, preencha todos os campos"

### 🔵 Info (Informação)

- **Cor**: Azul
- **Uso**: Informações gerais, status
- **Exemplo**: "Processando solicitação..."

## Características

### ✨ Animações

- **Entrada**: Desliza da direita com fade-in
- **Saída**: Desliza para direita com fade-out
- **Duração**: 300ms de transição

### ⏱️ Auto-remoção

- **Padrão**: 5 segundos
- **Configurável**: Passar duração em milissegundos
- **Manual**: Botão X para fechar

### 📱 Responsividade

- **Desktop**: Canto superior direito
- **Mobile**: Adaptado para telas menores
- **Acessibilidade**: Suporte a `aria-live`

### 🎨 Design

- **Sombras**: Elevação sutil
- **Bordas**: Arredondadas
- **Ícones**: SVG escaláveis
- **Tipografia**: Consistente com o design system

## Substituições Realizadas

Todos os `alert()` foram substituídos nas seguintes páginas:

### 📄 Páginas de Login

- `/login/page.tsx` - Login de gestores e funcionários
- `/acesso/page.tsx` - Primeiro acesso de funcionários

### 👥 Gestão de Funcionários

- `/gestor/page.tsx` - Dashboard do gestor
- `/cadastro-funcionario/page.tsx` - Cadastro de funcionários

### 💳 Checkout e Pagamentos

- `/checkout/page.tsx` - Fluxo de pagamento

### 📧 Testes de Email

- `/email-test/page.tsx` - Página de teste de emails

## Benefícios

### 🎯 UX Melhorada

- **Não-bloqueante**: Usuário pode continuar interagindo
- **Visualmente atrativo**: Design moderno e profissional
- **Contextual**: Cores indicam tipo de mensagem

### 🔧 Técnicos

- **Centralizadas**: Fácil manutenção e customização
- **Consistente**: Mesmo comportamento em toda aplicação
- **Extensível**: Fácil adicionar novos tipos

### ♿ Acessibilidade

- **Screen readers**: Suporte a `aria-live`
- **Keyboard navigation**: Navegação por teclado
- **High contrast**: Cores com bom contraste

## Exemplos de Migração

### ❌ Antes (alerts)

```tsx
// Validação
if (!email) {
  alert('Por favor, digite seu email')
  return
}

// Sucesso
if (response.ok) {
  alert('✅ Dados salvos com sucesso!')
  router.push('/dashboard')
}

// Erro
catch (error) {
  alert('Erro ao salvar dados')
}
```

### ✅ Depois (toasts)

```tsx
// Validação
if (!email) {
  showWarning('Por favor, digite seu email')
  return
}

// Sucesso
if (response.ok) {
  showSuccess('Dados salvos com sucesso!')
  router.push('/dashboard')
}

// Erro
catch (error) {
  showError('Erro ao salvar dados')
}
```

## Customização

### Duração Personalizada

```tsx
showSuccess('Mensagem rápida', undefined, 2000) // 2 segundos
showInfo('Mensagem longa', undefined, 10000)   // 10 segundos
```

### Múltiplos Toasts
O sistema suporta múltiplos toasts simultâneos, empilhados verticalmente.

### Temas Personalizados
Para adicionar novos tipos de toast, edite `Toast.tsx` e `ToastProvider.tsx`.

## Manutenção

### Adicionar Novo Tipo

1. Adicione o tipo em `ToastType`
2. Implemente cores e ícones em `Toast.tsx`
3. Adicione método helper em `ToastProvider.tsx`

### Modificar Estilos

- Cores: Edite as classes Tailwind em `getBgColor()` e `getTextColor()`
- Animações: Modifique as classes de transição
- Layout: Ajuste o container no `ToastProvider`

---

*Sistema implementado para melhorar a experiência do usuário e modernizar as notificações da aplicação.*
