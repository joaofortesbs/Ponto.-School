
// API para correção de tabelas do banco de dados
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Handler principal da API
export default async function handler(req, res) {
  // Verificar credenciais
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'Credenciais do Supabase não encontradas no ambiente' 
    });
  }

  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Criar extensão uuid-ossp (importante para as tabelas)
    try {
      await supabase.rpc('execute_sql', { 
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` 
      });
      console.log('✅ Extensão uuid-ossp criada/verificada com sucesso');
    } catch (extError) {
      console.log('ℹ️ Nota: Extensão uuid-ossp não pôde ser criada diretamente:', extError);
    }

    // Criar tabela grupos_estudo
    try {
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
      });
      console.log('✅ Tabela grupos_estudo criada com sucesso');
      
      // Criar índices e políticas após criar a tabela
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
          
          ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DO $$
          BEGIN
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem visualizar grupos"
                ON public.grupos_estudo FOR SELECT
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem inserir grupos"
                ON public.grupos_estudo FOR INSERT
                WITH CHECK (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem atualizar grupos"
                ON public.grupos_estudo FOR UPDATE
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem excluir grupos"
                ON public.grupos_estudo FOR DELETE
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END
          $$;
        `
      });
      console.log('✅ Índices e políticas para grupos_estudo criados com sucesso');
    } catch (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo:', gruposError);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao criar tabela grupos_estudo: ${gruposError.message || JSON.stringify(gruposError)}` 
      });
    }

    // Criar tabela codigos_grupos_estudo
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
            codigo VARCHAR(15) PRIMARY KEY,
            grupo_id UUID NOT NULL,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
            user_id UUID,
            privado BOOLEAN DEFAULT false,
            membros INTEGER DEFAULT 1,
            visibilidade VARCHAR(50),
            disciplina VARCHAR(100),
            cor VARCHAR(50) DEFAULT '#FF6B00',
            membros_ids JSONB DEFAULT '[]'::jsonb,
            ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      });
      console.log('✅ Tabela codigos_grupos_estudo criada com sucesso');
      
      // Criar índices e políticas após criar a tabela
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
          
          ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DO $$
          BEGIN
            BEGIN
              DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Todos podem visualizar códigos"
                ON public.codigos_grupos_estudo FOR SELECT
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Todos podem inserir códigos"
                ON public.codigos_grupos_estudo FOR INSERT
                WITH CHECK (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Todos podem atualizar códigos"
                ON public.codigos_grupos_estudo FOR UPDATE
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END
          $$;
        `
      });
      console.log('✅ Índices e políticas para codigos_grupos_estudo criados com sucesso');
    } catch (codigosError) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', codigosError);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao criar tabela codigos_grupos_estudo: ${codigosError.message || JSON.stringify(codigosError)}` 
      });
    }

    // Verificar se as tabelas foram criadas corretamente
    try {
      const { data: gruposCheck, error: gruposCheckError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);
        
      if (gruposCheckError) {
        console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposCheckError);
        return res.status(500).json({ 
          success: false, 
          error: `Erro ao verificar tabela grupos_estudo: ${gruposCheckError.message}` 
        });
      }
      
      const { data: codigosCheck, error: codigosCheckError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);
        
      if (codigosCheckError) {
        console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosCheckError);
        return res.status(500).json({ 
          success: false, 
          error: `Erro ao verificar tabela codigos_grupos_estudo: ${codigosCheckError.message}` 
        });
      }
      
      console.log('✅ Ambas as tabelas verificadas com sucesso!');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Tabelas criadas e verificadas com sucesso!' 
      });
    } catch (verifyError) {
      console.error('❌ Erro ao verificar tabelas:', verifyError);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao verificar tabelas: ${verifyError.message}` 
      });
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Erro geral: ${error.message}` 
    });
  }
}
