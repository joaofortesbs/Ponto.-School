
/**
 * Script para remover tabelas de códigos de grupos de estudo
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co',
  process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY'
);

async function dropCodigosGruposTables() {
  console.log('Iniciando remoção de tabelas de códigos de grupos...');
  
  try {
    // Remover políticas de segurança primeiro
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Todos os usuários podem visualizar códigos de grupos" ON public.codigos_grupos_estudo;
      DROP POLICY IF EXISTS "Usuários podem inserir novos códigos de grupos" ON public.codigos_grupos_estudo;
      DROP POLICY IF EXISTS "Apenas criadores podem atualizar informações de códigos" ON public.codigos_grupos_estudo;
    `;
    
    // Remover trigger e função
    const dropTriggersSQL = `
      DROP TRIGGER IF EXISTS update_codigos_grupos_timestamp ON public.codigos_grupos_estudo;
      DROP TRIGGER IF EXISTS sync_grupo_to_codigo ON public.grupos_estudo;
      DROP FUNCTION IF EXISTS update_codigos_grupos_timestamp();
      DROP FUNCTION IF EXISTS sync_grupo_to_codigo();
    `;
    
    // Remover índices
    const dropIndexesSQL = `
      DROP INDEX IF EXISTS idx_codigos_grupos_estudo_grupo_id;
      DROP INDEX IF EXISTS idx_codigos_grupos_estudo_user_id;
      DROP INDEX IF EXISTS idx_grupos_estudo_codigo_unique;
    `;
    
    // Remover tabela
    const dropTableSQL = `
      DROP TABLE IF EXISTS public.codigos_grupos_estudo;
    `;
    
    // Remover coluna de codigo da tabela grupos_estudo
    const dropColumnSQL = `
      ALTER TABLE IF EXISTS public.grupos_estudo DROP COLUMN IF EXISTS codigo;
    `;
    
    // Executar os comandos SQL
    console.log('Removendo políticas...');
    await supabase.rpc('execute_sql', { sql_query: dropPoliciesSQL });
    
    console.log('Removendo triggers e funções...');
    await supabase.rpc('execute_sql', { sql_query: dropTriggersSQL });
    
    console.log('Removendo índices...');
    await supabase.rpc('execute_sql', { sql_query: dropIndexesSQL });
    
    console.log('Removendo tabela...');
    await supabase.rpc('execute_sql', { sql_query: dropTableSQL });
    
    console.log('Removendo coluna codigo da tabela grupos_estudo...');
    await supabase.rpc('execute_sql', { sql_query: dropColumnSQL });
    
    console.log('Todas as estruturas relacionadas a códigos de grupos foram removidas com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a remoção de tabelas:', error);
    process.exit(1);
  }
}

// Executar o script
dropCodigosGruposTables()
  .then(() => {
    console.log('Processo de limpeza concluído!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Falha na limpeza:', err);
    process.exit(1);
  });
