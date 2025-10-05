#!/usr/bin/env python3
"""Script de teste para verificar conexão com banco externo"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.sync')

REPLIT_DB_URL = os.environ.get('DATABASE_URL')
EXTERNAL_DB_URL = os.environ.get('EXTERNAL_DB_URL')

print("\n" + "="*60)
print("🔍 TESTE DE CONEXÃO DOS BANCOS DE DADOS")
print("="*60 + "\n")

# Teste 1: Banco Replit
print("1️⃣  Testando banco NATIVO do Replit...")
try:
    conn = psycopg2.connect(REPLIT_DB_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM perfis")
    count = cursor.fetchone()[0]
    cursor.execute("SELECT name_user, email FROM perfis LIMIT 1")
    perfil = cursor.fetchone()
    print(f"   ✅ Conectado com sucesso!")
    print(f"   📊 Total de perfis: {count}")
    if perfil:
        print(f"   👤 Exemplo: {perfil[0]} ({perfil[1]})")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"   ❌ Erro: {e}")

print()

# Teste 2: Banco Externo
print("2️⃣  Testando banco EXTERNO Neon...")
if not EXTERNAL_DB_URL or "SENHA_AQUI" in EXTERNAL_DB_URL:
    print("   ⚠️  URL não configurada!")
    print("   ℹ️  Edite o arquivo .env.sync com suas credenciais")
    print("   ℹ️  Use a URL DIRETA (sem -pooler) do painel Neon")
else:
    try:
        # Esconder a senha no log
        safe_url = EXTERNAL_DB_URL.split('@')[1] if '@' in EXTERNAL_DB_URL else '...'
        print(f"   🔗 Conectando a: {safe_url}")
        
        conn = psycopg2.connect(EXTERNAL_DB_URL)
        cursor = conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'perfis'
            )
        """)
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            cursor.execute("SELECT COUNT(*) FROM perfis")
            count = cursor.fetchone()[0]
            print(f"   ✅ Conectado com sucesso!")
            print(f"   📊 Total de perfis: {count}")
            
            if count > 0:
                cursor.execute("SELECT name_user, email FROM perfis LIMIT 1")
                perfil = cursor.fetchone()
                print(f"   👤 Exemplo: {perfil[0]} ({perfil[1]})")
        else:
            print(f"   ✅ Conectado com sucesso!")
            print(f"   ⚠️  Tabela 'perfis' não existe (será criada na sincronização)")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        print()
        print("   💡 Dicas para resolver:")
        print("      • Verifique se a senha está correta")
        print("      • Use a URL DIRETA (sem -pooler)")
        print("      • Confirme que o banco está ativo no painel Neon")

print()
print("="*60 + "\n")
