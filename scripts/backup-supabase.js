
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupTable(tableName) {
  try {
    console.log(`Fazendo backup da tabela: ${tableName}`);
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Erro ao fazer backup da tabela ${tableName}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao acessar tabela ${tableName}:`, error);
    return null;
  }
}

async function main() {
  console.log('Iniciando backup do Supabase...');
  
  const tables = [
    'profiles',
    'user_account_info',
    'user_education',
    'user_interests',
    'user_skills',
    'user_tasks',
    'user_notification_settings',
    'user_payment_methods',
    'user_payment_subscription',
    'user_privacy_settings',
    'user_profiles_bio',
    'user_security_settings',
    'user_wallet_settings',
    'user_streak',
    'user_focus',
    'flow_sessions',
    'calendar_events',
    'grupos_estudo',
    'membros_grupos',
    'mensagens_grupos',
    'mensagens_chat_grupos',
    'convites_grupos',
    'bloqueios_grupos',
    'friend_requests',
    'parceiros',
    'tarefas',
    'atividades_compartilhaveis'
  ];
  
  const backup = {
    timestamp: new Date().toISOString(),
    tables: {}
  };
  
  for (const table of tables) {
    const data = await backupTable(table);
    if (data) {
      backup.tables[table] = data;
      console.log(`✅ Backup da tabela ${table}: ${data.length} registros`);
    } else {
      console.log(`⚠️ Tabela ${table} não encontrada ou vazia`);
    }
  }
  
  // Salvar backup em arquivo
  const backupFile = `supabase-backup-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\n✅ Backup salvo em: ${backupFile}`);
  
  return backup;
}

main().catch(console.error);
