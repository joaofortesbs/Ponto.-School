#!/usr/bin/env python3
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import sys
from dotenv import load_dotenv

load_dotenv('.env.sync')

REPLIT_DB_URL = os.environ.get('DATABASE_URL')
EXTERNAL_DB_URL = os.environ.get('EXTERNAL_DB_URL')

if not EXTERNAL_DB_URL:
    print("❌ ERRO: Variável EXTERNAL_DB_URL não configurada!")
    print("   Configure a URL do banco externo no arquivo .env.sync")
    print("   Use a URL DIRETA (sem -pooler) do painel Neon")
    sys.exit(1)

def get_connection(db_url):
    """Cria conexão com o banco de dados"""
    return psycopg2.connect(db_url)

def sync_replit_to_external():
    """Sincroniza mudanças do banco Replit para o banco externo"""
    print("🔄 Sincronizando Replit → Externo...")
    
    replit_conn = get_connection(REPLIT_DB_URL)
    external_conn = get_connection(EXTERNAL_DB_URL)
    
    try:
        with replit_conn.cursor(cursor_factory=RealDictCursor) as replit_cur, \
             external_conn.cursor() as external_cur:
            
            # Buscar mudanças não sincronizadas
            replit_cur.execute("""
                SELECT * FROM perfis_changelog 
                WHERE synced = FALSE 
                ORDER BY change_timestamp ASC
            """)
            changes = replit_cur.fetchall()
            
            if not changes:
                print("  ✓ Nenhuma mudança pendente")
                return 0
            
            print(f"  📦 {len(changes)} mudança(s) encontrada(s)")
            
            synced_count = 0
            for change in changes:
                try:
                    if change['operation'] == 'INSERT' or change['operation'] == 'UPDATE':
                        # Verificar se o registro existe no banco externo
                        external_cur.execute(
                            "SELECT id FROM perfis WHERE id = %s",
                            (change['perfil_id'],)
                        )
                        exists = external_cur.fetchone()
                        
                        if exists:
                            # UPDATE
                            external_cur.execute("""
                                UPDATE perfis SET
                                    full_name = %s,
                                    name_user = %s,
                                    email = %s,
                                    tipo_conta = %s,
                                    avatar_url = %s,
                                    updated_at = %s,
                                    id_usuario = %s
                                WHERE id = %s
                            """, (
                                change['full_name'],
                                change['name_user'],
                                change['email'],
                                change['tipo_conta'],
                                change['avatar_url'],
                                change['updated_at'],
                                change['id_usuario'],
                                change['perfil_id']
                            ))
                            print(f"    ✓ UPDATE: {change['name_user']} ({change['email']})")
                        else:
                            # INSERT
                            external_cur.execute("""
                                INSERT INTO perfis (
                                    id, full_name, name_user, email, tipo_conta,
                                    avatar_url, created_at, updated_at, id_usuario
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """, (
                                change['perfil_id'],
                                change['full_name'],
                                change['name_user'],
                                change['email'],
                                change['tipo_conta'],
                                change['avatar_url'],
                                change['created_at'],
                                change['updated_at'],
                                change['id_usuario']
                            ))
                            print(f"    ✓ INSERT: {change['name_user']} ({change['email']})")
                    
                    elif change['operation'] == 'DELETE':
                        external_cur.execute(
                            "DELETE FROM perfis WHERE id = %s",
                            (change['perfil_id'],)
                        )
                        print(f"    ✓ DELETE: {change['name_user']} ({change['email']})")
                    
                    # Marcar como sincronizado
                    replit_cur.execute(
                        "UPDATE perfis_changelog SET synced = TRUE WHERE id = %s",
                        (change['id'],)
                    )
                    synced_count += 1
                    
                except Exception as e:
                    print(f"    ✗ Erro ao sincronizar mudança {change['id']}: {e}")
                    continue
            
            external_conn.commit()
            replit_conn.commit()
            print(f"  ✅ {synced_count} mudança(s) sincronizada(s) com sucesso")
            return synced_count
            
    except Exception as e:
        print(f"  ❌ Erro na sincronização: {e}")
        replit_conn.rollback()
        external_conn.rollback()
        return 0
    finally:
        replit_conn.close()
        external_conn.close()

def sync_external_to_replit():
    """Sincroniza mudanças do banco externo para o banco Replit"""
    print("🔄 Sincronizando Externo → Replit...")
    
    replit_conn = get_connection(REPLIT_DB_URL)
    external_conn = get_connection(EXTERNAL_DB_URL)
    
    try:
        with replit_conn.cursor(cursor_factory=RealDictCursor) as replit_cur, \
             external_conn.cursor(cursor_factory=RealDictCursor) as external_cur:
            
            # Buscar todos os perfis do banco externo
            external_cur.execute("SELECT * FROM perfis")
            external_perfis = external_cur.fetchall()
            
            # Buscar todos os perfis do banco Replit
            replit_cur.execute("SELECT * FROM perfis")
            replit_perfis = {p['id']: p for p in replit_cur.fetchall()}
            
            synced_count = 0
            
            for ext_perfil in external_perfis:
                try:
                    replit_perfil = replit_perfis.get(ext_perfil['id'])
                    
                    if not replit_perfil:
                        # INSERT: perfil existe no externo mas não no Replit
                        replit_cur.execute("""
                            INSERT INTO perfis (
                                id, full_name, name_user, email, tipo_conta,
                                avatar_url, created_at, updated_at, id_usuario
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            ext_perfil['id'],
                            ext_perfil['full_name'],
                            ext_perfil['name_user'],
                            ext_perfil['email'],
                            ext_perfil['tipo_conta'],
                            ext_perfil['avatar_url'],
                            ext_perfil['created_at'],
                            ext_perfil['updated_at'],
                            ext_perfil['id_usuario']
                        ))
                        print(f"    ✓ INSERT: {ext_perfil['name_user']} ({ext_perfil['email']})")
                        synced_count += 1
                        
                    elif ext_perfil['updated_at'] and replit_perfil['updated_at']:
                        # UPDATE: verificar qual é mais recente
                        if ext_perfil['updated_at'] > replit_perfil['updated_at']:
                            replit_cur.execute("""
                                UPDATE perfis SET
                                    full_name = %s,
                                    name_user = %s,
                                    email = %s,
                                    tipo_conta = %s,
                                    avatar_url = %s,
                                    updated_at = %s,
                                    id_usuario = %s
                                WHERE id = %s
                            """, (
                                ext_perfil['full_name'],
                                ext_perfil['name_user'],
                                ext_perfil['email'],
                                ext_perfil['tipo_conta'],
                                ext_perfil['avatar_url'],
                                ext_perfil['updated_at'],
                                ext_perfil['id_usuario'],
                                ext_perfil['id']
                            ))
                            print(f"    ✓ UPDATE: {ext_perfil['name_user']} ({ext_perfil['email']})")
                            synced_count += 1
                            
                except Exception as e:
                    print(f"    ✗ Erro ao sincronizar perfil {ext_perfil.get('id', 'unknown')}: {e}")
                    continue
            
            # Verificar perfis que foram deletados no banco externo
            external_ids = {p['id'] for p in external_perfis}
            for replit_id in replit_perfis.keys():
                if replit_id not in external_ids:
                    try:
                        replit_cur.execute("DELETE FROM perfis WHERE id = %s", (replit_id,))
                        print(f"    ✓ DELETE: {replit_perfis[replit_id]['name_user']}")
                        synced_count += 1
                    except Exception as e:
                        print(f"    ✗ Erro ao deletar perfil {replit_id}: {e}")
            
            replit_conn.commit()
            
            if synced_count > 0:
                print(f"  ✅ {synced_count} mudança(s) sincronizada(s) com sucesso")
            else:
                print("  ✓ Nenhuma mudança pendente")
                
            return synced_count
            
    except Exception as e:
        print(f"  ❌ Erro na sincronização: {e}")
        replit_conn.rollback()
        return 0
    finally:
        replit_conn.close()
        external_conn.close()

def ensure_external_schema():
    """Garante que o banco externo tem a tabela perfis criada"""
    print("🔧 Verificando schema do banco externo...")
    
    external_conn = get_connection(EXTERNAL_DB_URL)
    
    try:
        with external_conn.cursor() as cur:
            cur.execute("""
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
            external_conn.commit()
            print("  ✓ Schema verificado/criado")
    except Exception as e:
        print(f"  ❌ Erro ao verificar schema: {e}")
    finally:
        external_conn.close()

def main():
    """Função principal de sincronização"""
    print("\n" + "="*60)
    print("🔄 SINCRONIZAÇÃO BIDIRECIONAL DE BANCOS DE DADOS")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    try:
        # Garantir que o schema existe no banco externo
        ensure_external_schema()
        print()
        
        # Sincronizar Replit → Externo
        count1 = sync_replit_to_external()
        print()
        
        # Sincronizar Externo → Replit
        count2 = sync_external_to_replit()
        print()
        
        total = count1 + count2
        if total > 0:
            print(f"✅ Sincronização concluída: {total} mudança(s) processada(s)")
        else:
            print("✅ Sincronização concluída: bancos em sincronia")
            
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        sys.exit(1)
    
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
