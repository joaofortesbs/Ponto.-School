# 🔄 Sistema de Sincronização Bidirecional de Bancos

## ✅ Status Atual

### Implementado:
- ✅ Banco PostgreSQL NATIVO do Replit criado e funcionando
- ✅ Tabela `perfis_changelog` para rastrear mudanças
- ✅ Triggers automáticos para capturar INSERT/UPDATE/DELETE
- ✅ Script Python de sincronização bidirecional
- ✅ Workflow configurado para executar a cada 5 minutos
- ✅ Scripts de teste preparados

### ⚠️ Pendente:
- ⏳ Configuração da URL do banco externo Neon

---

## 📝 Como Configurar

### 1. Obter URL do Banco Externo Neon

1. Acesse: https://console.neon.tech
2. Selecione seu projeto
3. Vá em **"Connection Details"**
4. Copie a **"Direct Connection"** (NÃO a "Pooled Connection")
   
   ✅ **URL correta** (sem `-pooler`):
   ```
   postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
   
   ❌ **URL incorreta** (com `-pooler`):
   ```
   postgresql://user:pass@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Configurar a URL

Edite o arquivo `.env.sync`:
```bash
EXTERNAL_DB_URL=postgresql://sua_url_completa_aqui
```

### 3. Testar Conexão

```bash
python3 scripts/test_sync_connection.py
```

---

## 🧪 Como Testar a Sincronização

### Teste 1: Replit → Externo

Insere um perfil no banco Replit e verifica se aparece no externo após 5 minutos:

```bash
python3 scripts/test_insert_replit.py
```

### Teste 2: Externo → Replit

Insere um perfil no banco externo e verifica se aparece no Replit após 5 minutos:

```bash
python3 scripts/test_insert_external.py
```

### Executar Sincronização Manualmente

Para não esperar 5 minutos, execute:

```bash
python3 scripts/sync_databases.py
```

---

## 🔧 Arquitetura do Sistema

### Banco NATIVO Replit
- **Tabela**: `perfis` (dados dos usuários)
- **Tabela**: `perfis_changelog` (log de mudanças)
- **Triggers**: Capturam INSERT/UPDATE/DELETE automaticamente

### Fluxo de Sincronização

```
Replit → Externo:
1. Usuário faz mudança na tabela `perfis`
2. Trigger registra na `perfis_changelog`
3. Script Python lê mudanças não sincronizadas
4. Aplica mudanças no banco externo
5. Marca como sincronizada

Externo → Replit:
1. Script compara timestamps das tabelas
2. Identifica registros mais recentes no externo
3. Atualiza/insere no banco Replit
4. Trigger do Replit registra mudança no changelog
```

### Workflow Automático
- Nome: `DB Sync`
- Frequência: A cada 5 minutos
- Comando: `bash scripts/sync_scheduler.sh`

---

## 📂 Arquivos do Sistema

```
scripts/
├── sync_databases.py          # Script principal de sincronização
├── sync_scheduler.sh           # Agendador (loop de 5 minutos)
├── test_sync_connection.py    # Teste de conexão
├── test_insert_replit.py      # Teste Replit → Externo
└── test_insert_external.py    # Teste Externo → Replit

.env.sync                       # Configuração da URL externa
```

---

## 🚀 Iniciar/Parar o Sync

### Iniciar
```bash
bash scripts/sync_scheduler.sh &
```

### Parar
```bash
pkill -f sync_scheduler.sh
```

### Ver Logs
Use o painel "DB Sync" na interface do Replit ou:
```bash
tail -f /tmp/logs/DB_Sync_*.log
```

---

## ⚠️ Resolução de Problemas

### Erro: "password authentication failed"
- ✅ Use a URL **DIRETA** (sem `-pooler`)
- ✅ Verifique se a senha está correta
- ✅ Confirme que o banco está ativo no painel Neon

### Mudanças não sincronizam
- Verifique se o workflow `DB Sync` está rodando
- Execute manualmente: `python3 scripts/sync_databases.py`
- Verifique os logs em `/tmp/logs/DB_Sync_*.log`

### Conflitos de dados
- O sistema usa `updated_at` para decidir qual versão é mais recente
- Mudanças mais recentes sempre sobrescrevem as antigas

---

## 📊 Monitoramento

### Ver mudanças pendentes no Replit:
```sql
SELECT * FROM perfis_changelog WHERE synced = FALSE;
```

### Ver total de perfis em cada banco:
```bash
# Replit
psql $DATABASE_URL -c "SELECT COUNT(*) FROM perfis"

# Externo (após configurar)
psql $EXTERNAL_DB_URL -c "SELECT COUNT(*) FROM perfis"
```
