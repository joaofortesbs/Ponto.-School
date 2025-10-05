#!/bin/bash

echo "🚀 Iniciando sincronização agendada de bancos de dados"
echo "⏰ Executando a cada 5 minutos"
echo ""

while true; do
    python3 scripts/sync_databases.py
    echo "⏳ Aguardando 5 minutos até próxima sincronização..."
    sleep 300
done
