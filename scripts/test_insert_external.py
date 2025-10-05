#!/usr/bin/env python3
"""Teste: Inserir perfil no banco externo e verificar sincronização para o Replit"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import uuid
from dotenv import load_dotenv

load_dotenv('.env.sync')

EXTERNAL_DB_URL = os.environ.get('EXTERNAL_DB_URL')

if not EXTERNAL_DB_URL or "SENHA_AQUI" in EXTERNAL_DB_URL:
    print("\n❌ Configure a URL do banco externo no arquivo .env.sync primeiro!\n")
    exit(1)

print("\n" + "="*60)
print("🧪 TESTE: Inserir no banco EXTERNO")
print("="*60 + "\n")

conn = psycopg2.connect(EXTERNAL_DB_URL)
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Criar um perfil de teste
test_id = str(uuid.uuid4())
test_user = f"usuario_externo_{datetime.now().strftime('%H%M%S')}"
test_email = f"{test_user}@teste.com"
test_name = "Usuário Externo de Teste"

print(f"📝 Inserindo novo perfil:")
print(f"   ID: {test_id}")
print(f"   Usuário: @{test_user}")
print(f"   Email: {test_email}")
print(f"   Nome: {test_name}")
print()

try:
    # Garantir que a tabela existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS perfis (
            id VARCHAR(255) PRIMARY KEY,
            full_name VARCHAR(255),
            name_user VARCHAR(255),
            email VARCHAR(255),
            tipo_conta VARCHAR(100),
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE,
            id_usuario VARCHAR(50)
        );
    """)
    
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
        'Teste Externo',
        None,
        datetime.now(),
        datetime.now(),
        'EXT_' + str(uuid.uuid4())[:8]
    ))
    conn.commit()
    print("✅ Perfil inserido no banco EXTERNO com sucesso!")
    print()
    print("🔄 Aguarde o próximo ciclo de sincronização (máx 5 minutos)")
    print("   para verificar se aparece no banco Replit!")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()

print("="*60 + "\n")
