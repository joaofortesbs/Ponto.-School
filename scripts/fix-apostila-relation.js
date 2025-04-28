
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter configurações do Supabase do ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verificar configurações
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixApostilaRelation() {
  try {
    console.log('Iniciando verificação da relação da Apostila Inteligente...');
    
    // Verificar se a tabela apostila_pastas existe, se não existir, criá-la
    const { data: tableCheck, error: tableError } = await supabase.rpc('execute_sql', {
      sql_statement: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'apostila_pastas'
        );
      `
    });

    if (tableError) {
      console.error('Erro ao verificar tabela apostila_pastas:', tableError);
      
      // Tentar criar a tabela apostila_pastas se ela não existir
      console.log('Tentando criar a tabela apostila_pastas...');
      const { error: createPastasError } = await supabase.rpc('execute_sql', {
        sql_statement: `
          CREATE TABLE IF NOT EXISTS apostila_pastas (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nome TEXT NOT NULL,
            cor TEXT DEFAULT '#42C5F5',
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Adicionar políticas RLS para apostila_pastas
          ALTER TABLE apostila_pastas ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Usuários podem ler suas próprias pastas" ON apostila_pastas;
          CREATE POLICY "Usuários podem ler suas próprias pastas" 
            ON apostila_pastas FOR SELECT 
            USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Usuários podem inserir suas próprias pastas" ON apostila_pastas;
          CREATE POLICY "Usuários podem inserir suas próprias pastas" 
            ON apostila_pastas FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias pastas" ON apostila_pastas;
          CREATE POLICY "Usuários podem atualizar suas próprias pastas" 
            ON apostila_pastas FOR UPDATE 
            USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Usuários podem excluir suas próprias pastas" ON apostila_pastas;
          CREATE POLICY "Usuários podem excluir suas próprias pastas" 
            ON apostila_pastas FOR DELETE 
            USING (auth.uid() = user_id);
        `
      });

      if (createPastasError) {
        console.error('Erro ao criar tabela apostila_pastas:', createPastasError);
        return;
      }
      
      console.log('Tabela apostila_pastas criada com sucesso!');
    } else {
      console.log('Tabela apostila_pastas já existe.');
    }
    
    // Verificar se a tabela apostila_anotacoes existe, se não existir, criá-la
    const { data: anotacoesCheck, error: anotacoesError } = await supabase.rpc('execute_sql', {
      sql_statement: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'apostila_anotacoes'
        );
      `
    });

    if (anotacoesError || !anotacoesCheck || !anotacoesCheck[0] || !anotacoesCheck[0].exists) {
      console.log('Tentando criar a tabela apostila_anotacoes...');
      const { error: createAnotacoesError } = await supabase.rpc('execute_sql', {
        sql_statement: `
          CREATE TABLE IF NOT EXISTS apostila_anotacoes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            tags TEXT[] DEFAULT '{}',
            pasta_id UUID REFERENCES apostila_pastas(id) ON DELETE SET NULL,
            modelo_anotacao TEXT DEFAULT 'Estudo Completo',
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            data_exportacao TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Adicionar políticas RLS para apostila_anotacoes
          ALTER TABLE apostila_anotacoes ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Usuários podem ler suas próprias anotações" ON apostila_anotacoes;
          CREATE POLICY "Usuários podem ler suas próprias anotações" 
            ON apostila_anotacoes FOR SELECT 
            USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Usuários podem inserir suas próprias anotações" ON apostila_anotacoes;
          CREATE POLICY "Usuários podem inserir suas próprias anotações" 
            ON apostila_anotacoes FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias anotações" ON apostila_anotacoes;
          CREATE POLICY "Usuários podem atualizar suas próprias anotações" 
            ON apostila_anotacoes FOR UPDATE 
            USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Usuários podem excluir suas próprias anotações" ON apostila_anotacoes;
          CREATE POLICY "Usuários podem excluir suas próprias anotações" 
            ON apostila_anotacoes FOR DELETE 
            USING (auth.uid() = user_id);
        `
      });

      if (createAnotacoesError) {
        console.error('Erro ao criar tabela apostila_anotacoes:', createAnotacoesError);
        return;
      }
      
      console.log('Tabela apostila_anotacoes criada com sucesso!');
    } else {
      console.log('Tabela apostila_anotacoes já existe.');
    }
    
    // Verificar se a chave estrangeira já existe
    const { data: foreignKeys, error: fkError } = await supabase.rpc('execute_sql', {
      sql_statement: `
        SELECT
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'apostila_anotacoes'
        AND kcu.column_name = 'pasta_id';
      `
    });

    if (fkError) {
      console.error('Erro ao verificar chave estrangeira:', fkError);
      return;
    }

    // Se a chave estrangeira não existir, adicioná-la
    if (!foreignKeys || foreignKeys.length === 0) {
      console.log('Chave estrangeira não encontrada. Adicionando...');
      
      // Adicionar a chave estrangeira
      const { data: addFkResult, error: addFkError } = await supabase.rpc('execute_sql', {
        sql_statement: `
          ALTER TABLE apostila_anotacoes
          ADD CONSTRAINT fk_apostila_pasta_id
          FOREIGN KEY (pasta_id)
          REFERENCES apostila_pastas(id)
          ON DELETE SET NULL;
        `
      });

      if (addFkError) {
        console.error('Erro ao adicionar chave estrangeira:', addFkError);
        return;
      }

      console.log('Chave estrangeira adicionada com sucesso!');
    } else {
      console.log('Chave estrangeira já existe:', foreignKeys[0]);
    }
    
    // Forçar recarga do esquema usando uma chamada para a função execute_sql com NOTIFY
    const { error: reloadError } = await supabase.rpc('execute_sql', {
      sql_statement: `
        SELECT pg_notify('pgrst', 'reload schema');
      `
    });

    if (reloadError) {
      console.warn('Aviso: Não foi possível recarregar o esquema:', reloadError);
    } else {
      console.log('Esquema do banco de dados recarregado com sucesso!');
    }

    console.log('Verificação e correção da relação da Apostila Inteligente concluídas com sucesso!');
  } catch (error) {
    console.error('Erro inesperado ao corrigir relação da Apostila:', error);
    process.exit(1);
  }
}

// Executar a função principal
fixApostilaRelation();
