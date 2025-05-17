
// Script aprimorado para verificar se a tabela friend_requests existe
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  console.log('Verificando se a tabela friend_requests existe...');
  
  try {
    // Método 1: Verificar através de uma consulta direta
    console.log('Método 1: Verificando através de consulta direta...');
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Método 1 falhou. Erro:', error.message);
      console.log('Tentando método alternativo...');
      
      // Método 2: Verificar usando a função execute_sql
      console.log('Método 2: Verificando se a tabela existe através de execute_sql...');
      
      const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'friend_requests'
          );
        `
      }).catch(() => ({ error: { message: 'Função execute_sql não existe ou não está acessível' } }));
      
      if (sqlError) {
        console.error('Método 2 falhou. Erro:', sqlError.message);
        
        // Método 3: Usar outra abordagem direta
        console.log('Método 3: Verificando através de uma abordagem diferente...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/friend_requests?select=id&limit=1`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        
        if (response.ok) {
          console.log('Método 3: Sucesso! A tabela friend_requests existe e está acessível.');
          return true;
        } else {
          console.error('Método 3 falhou. Status:', response.status);
          
          // Recomendações finais
          console.log('\nNenhum dos métodos conseguiu verificar a tabela friend_requests.');
          console.log('Possíveis causas e soluções:');
          console.log('1. A tabela ainda não foi criada - Execute o script create-friend-requests-table.js');
          console.log('2. Problemas de permissão - Verifique se você tem as permissões corretas');
          console.log('3. Problemas com as chaves API - Verifique se suas chaves API são válidas');
          return false;
        }
      } else {
        const tableExists = sqlData && sqlData.length > 0;
        if (tableExists) {
          console.log('Método 2: Sucesso! A tabela friend_requests existe no banco de dados.');
          return true;
        } else {
          console.error('Método 2: A tabela friend_requests não foi encontrada.');
          return false;
        }
      }
    } else {
      console.log('Método 1: Sucesso! A tabela friend_requests existe e está acessível.');
      
      // Exibir estrutura da tabela para confirmação
      console.log('\nDetalhes da tabela friend_requests:');
      
      const { data: columnsData, error: columnsError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'friend_requests';
        `
      }).catch(() => ({ error: { message: 'Não foi possível obter detalhes das colunas' } }));
      
      if (!columnsError && columnsData) {
        console.log('Colunas encontradas na tabela.');
      }
      
      return true;
    }
  } catch (error) {
    console.error('Erro inesperado ao verificar tabela friend_requests:', error);
    return false;
  }
}

// Executar a verificação
checkTable().then(exists => {
  if (exists) {
    console.log('\n✅ Verificação concluída com sucesso!');
  } else {
    console.log('\n❌ A tabela não foi encontrada ou não está acessível.');
    console.log('Execute o script create-friend-requests-table.js para criar a tabela.');
  }
});
