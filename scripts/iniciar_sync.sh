#!/bin/bash
# Script para iniciar sincronização após configurar a URL externa

echo "🔍 Verificando configuração..."
echo ""

# Verificar se a URL está configurada
if ! grep -q "SENHA_AQUI" .env.sync 2>/dev/null; then
    echo "✅ Configuração encontrada!"
    echo ""
    
    # Testar conexão primeiro
    echo "🧪 Testando conexões..."
    python3 scripts/test_sync_connection.py
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🚀 Iniciando sincronização automática..."
        echo "⏰ Executando a cada 5 minutos"
        echo ""
        bash scripts/sync_scheduler.sh
    else
        echo ""
        echo "❌ Erro na conexão. Verifique a URL em .env.sync"
        exit 1
    fi
else
    echo "⚠️  URL não configurada!"
    echo ""
    echo "📝 Siga estes passos:"
    echo ""
    echo "1. Abra: .env.sync"
    echo "2. Cole a URL DIRETA do banco Neon (sem -pooler)"
    echo "3. Salve o arquivo"
    echo "4. Execute: bash scripts/iniciar_sync.sh"
    echo ""
    exit 1
fi
