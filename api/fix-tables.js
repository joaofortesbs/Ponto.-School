// API endpoint para executar a correção de tabelas
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    console.log('Iniciando criação/correção de tabelas...');
    
    // Primeiro, tente usar o cliente Supabase diretamente
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      
      // Criar extensão uuid-ossp se não existir
      try {
        await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        console.log('✅ Extensão uuid-ossp verificada/criada');
      } catch (extError) {
        console.log('ℹ️ Nota: Não foi possível verificar/criar extensão uuid-ossp:', extError);
      }
      
      // Criar tabela grupos_estudo
      try {
        await supabase.query(`
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
          
          CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
          
          ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
          CREATE POLICY "Usuários podem visualizar grupos"
            ON public.grupos_estudo FOR SELECT
            USING (true);
            
          DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
          CREATE POLICY "Usuários podem inserir grupos"
            ON public.grupos_estudo FOR INSERT
            WITH CHECK (true);
            
          DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
          CREATE POLICY "Usuários podem atualizar grupos"
            ON public.grupos_estudo FOR UPDATE
            USING (true);
        `);
        console.log('✅ Tabela grupos_estudo criada/verificada com sucesso');
      } catch (gruposError) {
        console.error('❌ Erro ao criar tabela grupos_estudo:', gruposError);
        throw gruposError;
      }
      
      // Criar tabela codigos_grupos_estudo
      try {
        await supabase.query(`
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
          
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
          
          ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
          CREATE POLICY "Todos podem visualizar códigos"
            ON public.codigos_grupos_estudo FOR SELECT
            USING (true);
            
          DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
          CREATE POLICY "Todos podem inserir códigos"
            ON public.codigos_grupos_estudo FOR INSERT
            WITH CHECK (true);
            
          DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
          CREATE POLICY "Todos podem atualizar códigos"
            ON public.codigos_grupos_estudo FOR UPDATE
            USING (true);
        `);
        console.log('✅ Tabela codigos_grupos_estudo criada/verificada com sucesso');
      } catch (codigosError) {
        console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', codigosError);
        throw codigosError;
      }
      
      // Verificar se as tabelas foram criadas com sucesso
      try {
        const { data: gruposCheck, error: gruposCheckError } = await supabase
          .from('grupos_estudo')
          .select('id')
          .limit(1);
          
        if (gruposCheckError) {
          console.error('❌ Verificação da tabela grupos_estudo falhou:', gruposCheckError);
          throw gruposCheckError;
        }
        
        const { data: codigosCheck, error: codigosCheckError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .limit(1);
          
        if (codigosCheckError) {
          console.error('❌ Verificação da tabela codigos_grupos_estudo falhou:', codigosCheckError);
          throw codigosCheckError;
        }
        
        console.log('✅ Ambas as tabelas estão acessíveis!');
        
        return res.status(200).json({ 
          success: true, 
          message: 'Tabelas criadas e verificadas com sucesso',
          method: 'direct'
        });
      } catch (checkError) {
        console.error('❌ Erro ao verificar tabelas:', checkError);
        throw checkError;
      }
    } catch (directError) {
      console.error('❌ Método direto falhou, tentando script externo:', directError);
      
      try {
        // Como backup, execute o script fix-missing-tables.js
        const output = execSync('node scripts/fix-missing-tables.js', { encoding: 'utf8' });
        console.log('✅ Script executado com sucesso:', output);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Tabelas corrigidas via script externo',
          method: 'script',
          output
        });
      } catch (execError) {
        console.error('❌ Erro ao executar script:', execError);
        return res.status(500).json({ 
          success: false, 
          message: `Não foi possível criar as tabelas: ${execError.message}`,
          error: execError.toString()
        });
      }
    }
  } catch (error) {
    console.error('❌ Erro no endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Erro no endpoint: ${error.message}`,
      error: error.toString() 
    });
  }
}