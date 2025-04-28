
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Verificar configurações
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  try {
    console.log('Verificando relação entre apostila_anotacoes e apostila_pastas...');
    
    // Verificar se a chave estrangeira já existe
    const { data: foreignKeys, error: fkError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'apostila_anotacoes'
          AND kcu.column_name = 'pasta_id';
      `
    });

    if (fkError) {
      console.error('Erro ao verificar chaves estrangeiras:', fkError);
      process.exit(1);
    }

    if (foreignKeys && foreignKeys.length > 0) {
      console.log('A chave estrangeira já existe:', foreignKeys);
      console.log('Não é necessário criar novamente.');
    } else {
      console.log('Chave estrangeira não encontrada. Criando relação...');
      
      // Adicionar a chave estrangeira
      const { data: addFkResult, error: addFkError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE apostila_anotacoes
          ADD CONSTRAINT fk_apostila_pasta_id
          FOREIGN KEY (pasta_id)
          REFERENCES apostila_pastas (id)
          ON DELETE SET NULL;
        `
      });
      
      if (addFkError) {
        console.error('Erro ao adicionar chave estrangeira:', addFkError);
        process.exit(1);
      }
      
      console.log('Chave estrangeira adicionada com sucesso!');
    }
    
    // Verificando se a recarga do esquema é necessária
    console.log('Verificando integridade do esquema...');
    
    // Testar uma consulta com junção para verificar se o esquema está atualizado
    const { data: testQuery, error: testError } = await supabase
      .from('apostila_anotacoes')
      .select('id, apostila_pastas(*)')
      .limit(1);
    
    if (testError && testError.message.includes('relationship')) {
      console.log('O esquema precisa ser recarregado. Atualizando cache...');
      
      // Forçar recarga do esquema usando uma chamada para a função execute_sql com NOTIFY
      const { error: reloadError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT pg_notify('pgrst', 'reload schema');
        `
      });
      
      if (reloadError) {
        console.error('Erro ao recarregar esquema:', reloadError);
        console.log('Recomendação: Reinicie o projeto no Supabase Dashboard > Configurações > Geral > Reiniciar Projeto');
      } else {
        console.log('Notificação para recarga do esquema enviada com sucesso!');
        console.log('Aguarde alguns instantes para que o esquema seja recarregado.');
      }
    } else if (testError) {
      console.error('Erro ao testar consulta, mas não relacionado ao esquema:', testError);
    } else {
      console.log('Esquema está funcionando corretamente!');
    }
    
    console.log('\nProcesso finalizado com sucesso!');
    
  } catch (error) {
    console.error('Erro durante o processo:', error);
    process.exit(1);
  }
}

main();
