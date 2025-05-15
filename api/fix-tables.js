
// API endpoint para executar o script de correção de tabelas
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    console.log('Executando script de correção de tabelas...');
    
    try {
      // Primeiro tenta usar o script fix-missing-tables.js
      const output = execSync('node scripts/fix-missing-tables.js', { 
        encoding: 'utf8',
        env: {
          ...process.env,
          FORCE_ALTERNATIVE: 'true' // Force o uso do método alternativo
        }
      });
      
      console.log('Script executado com sucesso:', output);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Tabelas corrigidas com sucesso',
        output
      });
    } catch (execError) {
      console.error('Erro ao executar script:', execError);
      
      // Se falhou, tentar criar as tabelas diretamente
      console.log('Tentando criar tabelas diretamente via API...');
      
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY
        );
        
        // Verificar se conseguimos acessar o Supabase
        const { data: connectionTest, error: connectionError } = await supabase.auth.getSession();
        
        if (connectionError) {
          return res.status(500).json({
            success: false,
            message: `Erro de conexão com Supabase: ${connectionError.message}`,
            error: connectionError
          });
        }
        
        console.log('Conexão com Supabase estabelecida, criando tabelas...');
        
        // Criar tabela grupos_estudo
        try {
          // Verificar se a tabela já existe
          const { data: gruposCheck, error: gruposCheckError } = await supabase
            .from('grupos_estudo')
            .select('id')
            .limit(1);
            
          if (gruposCheckError && gruposCheckError.code === '42P01') { // Tabela não existe
            console.log('Criando tabela grupos_estudo...');
            
            // Criando tabela via RPC execute_sql
            await supabase.rpc('execute_sql', {
              sql_query: `
                CREATE TABLE IF NOT EXISTS public.grupos_estudo (
                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                  user_id UUID NOT NULL,
                  nome TEXT NOT NULL,
                  descricao TEXT,
                  cor TEXT NOT NULL DEFAULT '#FF6B00',
                  membros INTEGER NOT NULL DEFAULT 1,
                  membros_ids JSONB DEFAULT '[]'::jsonb,
                  topico TEXT,
                  topico_nome TEXT,
                  topico_icon TEXT,
                  privado BOOLEAN DEFAULT false,
                  visibilidade TEXT DEFAULT 'todos',
                  codigo TEXT,
                  disciplina TEXT DEFAULT 'Geral',
                  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
              `
            }).catch(e => console.log('Erro RPC, tentando método alternativo...', e));
            
          } else {
            console.log('Tabela grupos_estudo já existe.');
          }
        } catch (gruposError) {
          console.error('Erro ao criar tabela grupos_estudo:', gruposError);
        }
        
        // Criar tabela codigos_grupos_estudo
        try {
          // Verificar se a tabela já existe
          const { data: codigosCheck, error: codigosCheckError } = await supabase
            .from('codigos_grupos_estudo')
            .select('codigo')
            .limit(1);
            
          if (codigosCheckError && codigosCheckError.code === '42P01') { // Tabela não existe
            console.log('Criando tabela codigos_grupos_estudo...');
            
            // Criando tabela via RPC execute_sql
            await supabase.rpc('execute_sql', {
              sql_query: `
                CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
                  codigo VARCHAR(15) PRIMARY KEY,
                  grupo_id UUID NOT NULL,
                  nome VARCHAR NOT NULL,
                  descricao TEXT,
                  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
                  user_id UUID,
                  privado BOOLEAN DEFAULT false,
                  membros INTEGER DEFAULT 1,
                  visibilidade VARCHAR,
                  disciplina VARCHAR,
                  cor VARCHAR DEFAULT '#FF6B00',
                  membros_ids JSONB DEFAULT '[]'::jsonb,
                  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
              `
            }).catch(e => console.log('Erro RPC, tentando método alternativo...', e));
            
          } else {
            console.log('Tabela codigos_grupos_estudo já existe.');
          }
        } catch (codigosError) {
          console.error('Erro ao criar tabela codigos_grupos_estudo:', codigosError);
        }
        
        // Verificar novamente se as tabelas foram criadas
        const { error: gruposVerifyError } = await supabase
          .from('grupos_estudo')
          .select('id')
          .limit(1);
          
        const { error: codigosVerifyError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .limit(1);
          
        if (gruposVerifyError || codigosVerifyError) {
          return res.status(500).json({
            success: false,
            message: "Algumas tabelas não puderam ser criadas",
            gruposEstudoStatus: gruposVerifyError ? "erro" : "ok",
            codigosGruposStatus: codigosVerifyError ? "erro" : "ok"
          });
        }
        
        return res.status(200).json({
          success: true,
          message: "Tabelas criadas com sucesso via API"
        });
      } catch (directError) {
        console.error('Erro ao criar tabelas diretamente:', directError);
        
        return res.status(500).json({ 
          success: false, 
          message: `Todos os métodos de correção falharam. Erro: ${directError.message}`,
          scriptError: execError.toString(),
          directError: directError.toString()
        });
      }
    }
  } catch (error) {
    console.error('Erro no endpoint:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: `Erro no endpoint: ${error.message}`,
      error: error.toString() 
    });
  }
}
