#!/bin/bash

# Script para aplicar a configuração de propriedade de vídeos
# Execute este script para adicionar as colunas necessárias ao banco de dados

echo "🔧 Configurando propriedade de vídeos..."
echo ""
echo "📋 INSTRUÇÕES:"
echo "1. Acesse o Supabase Dashboard (https://supabase.com/dashboard)"
echo "2. Entre no seu projeto"
echo "3. Vá em SQL Editor"
echo "4. Copie e execute o conteúdo do arquivo: database/add-video-ownership.sql"
echo ""
echo "🎯 Este script adiciona:"
echo "- Coluna created_by_type (system/manager)"
echo "- Coluna created_by_id (ID do gestor)"
echo "- Coluna manager_id (referência)"
echo "- Coluna company_id (referência)" 
echo "- Coluna display_order (ordem)"
echo "- Políticas RLS de segurança"
echo ""
echo "📁 Arquivo SQL: database/add-video-ownership.sql"
echo ""

# Mostrar o conteúdo do arquivo SQL para facilitar a cópia
if [ -f "database/add-video-ownership.sql" ]; then
    echo "📄 CONTEÚDO DO ARQUIVO SQL:"
    echo "===================="
    cat database/add-video-ownership.sql
    echo ""
    echo "===================="
    echo ""
    echo "✅ Copie todo o conteúdo acima e execute no SQL Editor do Supabase"
else
    echo "❌ Arquivo database/add-video-ownership.sql não encontrado!"
fi

echo ""
echo "🧪 Após executar o SQL, teste com:"
echo "1. Faça login como gestor"
echo "2. Vá para /gestor/videos"
echo "3. Execute o script: scripts/test-video-upload.js (no Console do navegador)"