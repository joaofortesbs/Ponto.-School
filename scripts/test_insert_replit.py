#!/usr/bin/env python3
"""Teste: Inserir perfil no banco Replit e verificar sincronização para o externo"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import uuid

REPLIT_DB_URL = os.environ.get('DATABASE_URL')

print("\n" + "="*60)
print("🧪 TESTE: Inserir no banco REPLIT")
print("="*60 + "\n")

conn = psycopg2.connect(REPLIT_DB_URL)
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Criar um perfil de teste
test_id = str(uuid.uuid4())
test_user = f"usuario_teste_{datetime.now().strftime('%H%M%S')}"
test_email = f"{test_user}@teste.com"
test_name = "Usuário de Teste"

print(f"📝 Inserindo novo perfil:")
print(f"   ID: {test_id}")
print(f"   Usuário: @{test_user}")
print(f"   Email: {test_email}")
print(f"   Nome: {test_name}")
print()

try:
    cursor.execute("""
        INSERT INTO perfis (
            id, full_name, name_user, email, tipo_conta,
            avatar_url, created_at, updated_at, id_usuario
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        test_id,
        test_name,
        test_user,
        test_email,
        'Teste',
        None,
        datetime.now(),
        datetime.now(),
        'TEST_' + str(uuid.uuid4())[:8]
    ))
    conn.commit()
    print("✅ Perfil inserido no banco REPLIT com sucesso!")
    print()
    
    # Verificar se o trigger criou um log
    cursor.execute("""
        SELECT * FROM perfis_changelog 
        WHERE perfil_id = %s 
        ORDER BY change_timestamp DESC 
        LIMIT 1
    """, (test_id,))
    
    log = cursor.fetchone()
    if log:
        print("✅ Trigger funcionou! Log criado:")
        print(f"   Operação: {log['operation']}")
        print(f"   Timestamp: {log['change_timestamp']}")
        print(f"   Sincronizado: {'Sim' if log['synced'] else 'Não (pendente)'}")
    else:
        print("⚠️  Nenhum log encontrado (trigger pode não estar funcionando)")
    
    print()
    print("🔄 Aguarde o próximo ciclo de sincronização (máx 5 minutos)")
    print("   para verificar se aparece no banco externo!")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()

print("="*60 + "\n")
