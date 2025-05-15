
/**
 * Script para corrigir ou criar tabelas de grupos
 * Este script criará as tabelas necessárias se elas não existirem
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function verificarTabelasExistentes() {
  console.log('Verificando tabelas existentes...');
  
  try {
    // Verificar tabela grupos_estudo
    const { data: gruposCount, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('*', { count: 'exact', head: true });
      
    if (gruposError && gruposError.code === '42P01') {
      console.log('❌ Tabela grupos_estudo não existe.');
      return { grupos: false };
    } else if (gruposError) {
      console.error('⚠️ Erro ao verificar tabela grupos_estudo:', gruposError);
      return { grupos: false };
    } else {
      console.log(`✅ Tabela grupos_estudo existe com ${gruposCount || 0} registros.`);
      return { grupos: true };
    }
  } catch (error) {
    console.error('⚠️ Erro durante verificação:', error);
    return { grupos: false };
  }
}

async function criarTabelaGrupos() {
  console.log('Criando tabela grupos_estudo...');
  
  try {
    // Criar extensão uuid se não existir
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('✅ Extensão uuid-ossp criada/verificada.');
    } catch (extError) {
      console.warn('⚠️ Não foi possível verificar extensão uuid-ossp. O banco pode não ter permissões para criar extensões.', extError);
    }
    
    // Criar tabela grupos_estudo
    const sql = `
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
      CREATE INDEX IF NOT EXISTS grupos_estudo_codigo_idx ON public.grupos_estudo(codigo);
      
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
        
      DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
      CREATE POLICY "Usuários podem excluir grupos"
        ON public.grupos_estudo FOR DELETE
        USING (true);
    `;
    
    try {
      const { error } = await supabase.query(sql);
      
      if (error) {
        console.error('❌ Erro ao criar tabela grupos_estudo via query:', error);
        
        // Tentar método alternativo com RPC
        try {
          console.log('Tentando método alternativo via RPC...');
          const { error: rpcError } = await supabase.rpc('execute_sql', {
            sql_query: sql
          });
          
          if (rpcError) {
            console.error('❌ Erro ao criar tabela grupos_estudo via RPC:', rpcError);
            return false;
          }
          
          console.log('✅ Tabela grupos_estudo criada com sucesso via RPC!');
          return true;
        } catch (rpcError) {
          console.error('❌ Erro ao chamar RPC para criar tabela:', rpcError);
          return false;
        }
      }
      
      console.log('✅ Tabela grupos_estudo criada com sucesso!');
      return true;
    } catch (createError) {
      console.error('❌ Erro ao executar SQL de criação de grupos_estudo:', createError);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao criar tabela grupos_estudo:', error);
    return false;
  }
}

async function criarTabelaCodigos() {
  console.log('Criando tabela codigos_grupos_estudo...');
  
  try {
    const sql = `
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
      
      -- Função para atualizar o timestamp de última atualização
      CREATE OR REPLACE FUNCTION update_codigos_grupos_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.ultima_atualizacao = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Trigger para atualização automática do timestamp
      DROP TRIGGER IF EXISTS update_codigos_grupos_timestamp ON public.codigos_grupos_estudo;
      CREATE TRIGGER update_codigos_grupos_timestamp
      BEFORE UPDATE ON public.codigos_grupos_estudo
      FOR EACH ROW EXECUTE FUNCTION update_codigos_grupos_timestamp();
      
      -- Função para sincronizar automaticamente os dados do grupo com a tabela de códigos
      CREATE OR REPLACE FUNCTION sync_grupo_to_codigo()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Se o grupo tem um código, atualize a tabela de códigos
        IF NEW.codigo IS NOT NULL THEN
          INSERT INTO public.codigos_grupos_estudo(
            codigo, 
            grupo_id, 
            nome, 
            descricao, 
            user_id, 
            privado, 
            membros, 
            visibilidade, 
            disciplina, 
            cor, 
            membros_ids
          ) VALUES (
            NEW.codigo,
            NEW.id,
            NEW.nome,
            NEW.descricao,
            NEW.user_id,
            NEW.privado,
            NEW.membros,
            NEW.visibilidade,
            NEW.disciplina,
            NEW.cor,
            COALESCE(NEW.membros_ids, '[]'::jsonb)
          )
          ON CONFLICT (codigo) 
          DO UPDATE SET
            nome = EXCLUDED.nome,
            descricao = EXCLUDED.descricao,
            user_id = EXCLUDED.user_id,
            privado = EXCLUDED.privado,
            membros = EXCLUDED.membros,
            visibilidade = EXCLUDED.visibilidade,
            disciplina = EXCLUDED.disciplina,
            cor = EXCLUDED.cor,
            membros_ids = EXCLUDED.membros_ids,
            ultima_atualizacao = NOW();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Trigger para sincronizar os dados automaticamente
      DROP TRIGGER IF EXISTS sync_grupo_to_codigo ON public.grupos_estudo;
      CREATE TRIGGER sync_grupo_to_codigo
      AFTER INSERT OR UPDATE ON public.grupos_estudo
      FOR EACH ROW EXECUTE FUNCTION sync_grupo_to_codigo();
      
      -- Políticas de segurança
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
    `;
    
    try {
      const { error } = await supabase.query(sql);
      
      if (error) {
        console.error('❌ Erro ao criar tabela codigos_grupos_estudo via query:', error);
        
        // Tentar método alternativo
        try {
          console.log('Tentando método alternativo via RPC...');
          const { error: rpcError } = await supabase.rpc('execute_sql', {
            sql_query: sql
          });
          
          if (rpcError) {
            console.error('❌ Erro ao criar tabela codigos_grupos_estudo via RPC:', rpcError);
            return false;
          }
          
          console.log('✅ Tabela codigos_grupos_estudo criada com sucesso via RPC!');
          return true;
        } catch (rpcError) {
          console.error('❌ Erro ao chamar RPC para criar tabela:', rpcError);
          return false;
        }
      }
      
      console.log('✅ Tabela codigos_grupos_estudo criada com sucesso!');
      return true;
    } catch (createError) {
      console.error('❌ Erro ao executar SQL de criação de codigos_grupos_estudo:', createError);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', error);
    return false;
  }
}

async function verificarAcessoTabelas() {
  console.log('Verificando acesso às tabelas...');
  
  try {
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('id, nome, codigo')
      .limit(1);
      
    if (grupoError) {
      console.error('❌ Não foi possível acessar tabela grupos_estudo:', grupoError);
      return false;
    }
    
    console.log('✅ Acesso à tabela grupos_estudo verificado.', grupo ? `Exemplo de registro: ${JSON.stringify(grupo[0])}` : 'Tabela vazia.');
    
    const { data: codigo, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo, grupo_id, nome')
      .limit(1);
      
    if (codigoError) {
      console.error('❌ Não foi possível acessar tabela codigos_grupos_estudo:', codigoError);
      return false;
    }
    
    console.log('✅ Acesso à tabela codigos_grupos_estudo verificado.', codigo ? `Exemplo de registro: ${JSON.stringify(codigo[0])}` : 'Tabela vazia.');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar acesso às tabelas:', error);
    return false;
  }
}

async function sincronizarCodigosExistentes() {
  console.log('Sincronizando códigos existentes...');
  
  try {
    // Buscar grupos com código
    const { data: grupos, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .not('codigo', 'is', null);
      
    if (error) {
      console.error('❌ Erro ao buscar grupos com código:', error);
      return false;
    }
    
    console.log(`ℹ️ Encontrados ${grupos?.length || 0} grupos com código para sincronizar.`);
    
    let sucessos = 0;
    let erros = 0;
    
    // Sincronizar cada grupo
    for (const grupo of grupos || []) {
      try {
        // Inserir ou atualizar na tabela de códigos
        const { error: inserirError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert({
            codigo: grupo.codigo,
            grupo_id: grupo.id,
            nome: grupo.nome || 'Grupo sem nome',
            descricao: grupo.descricao || '',
            user_id: grupo.user_id,
            privado: grupo.privado || false,
            membros: grupo.membros || 1,
            visibilidade: grupo.visibilidade || 'todos',
            disciplina: grupo.disciplina || '',
            cor: grupo.cor || '#FF6B00',
            membros_ids: grupo.membros_ids || [],
            data_criacao: grupo.data_criacao || new Date().toISOString(),
            ultima_atualizacao: new Date().toISOString()
          }, { onConflict: 'codigo' });
          
        if (inserirError) {
          console.error(`❌ Erro ao sincronizar código ${grupo.codigo}:`, inserirError);
          erros++;
        } else {
          console.log(`✅ Código ${grupo.codigo} para grupo "${grupo.nome}" sincronizado com sucesso.`);
          sucessos++;
        }
      } catch (grupoError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}:`, grupoError);
        erros++;
      }
    }
    
    console.log('\n=== RESULTADO DA SINCRONIZAÇÃO ===');
    console.log(`✅ Códigos sincronizados: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log('================================\n');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar códigos:', error);
    return false;
  }
}

async function corrigirTabelas() {
  console.log('\n==== INICIANDO CORREÇÃO DE TABELAS DE GRUPOS ====\n');
  
  try {
    // Verificar tabelas existentes
    const status = await verificarTabelasExistentes();
    
    if (!status.grupos) {
      // Criar tabela grupos_estudo
      const gruposCriados = await criarTabelaGrupos();
      if (!gruposCriados) {
        console.error('❌ Falha ao criar tabela grupos_estudo. Abortando.');
        return false;
      }
    }
    
    // Criar/verificar tabela de códigos
    const codigosCriados = await criarTabelaCodigos();
    if (!codigosCriados) {
      console.error('❌ Falha ao criar tabela codigos_grupos_estudo.');
      // Continuar mesmo com erros na tabela de códigos
    }
    
    // Verificar acesso
    const acessoOK = await verificarAcessoTabelas();
    if (!acessoOK) {
      console.error('❌ Falha ao verificar acesso às tabelas. Algo pode estar errado com as permissões.');
      return false;
    }
    
    // Sincronizar códigos existentes
    await sincronizarCodigosExistentes();
    
    console.log('\n✅✅✅ CORREÇÃO DE TABELAS CONCLUÍDA COM SUCESSO! ✅✅✅\n');
    return true;
  } catch (error) {
    console.error('❌ Erro durante correção de tabelas:', error);
    return false;
  }
}

// Executar script
corrigirTabelas()
  .then(success => {
    if (success) {
      console.log('🎉 Script finalizado com sucesso!');
      process.exit(0);
    } else {
      console.error('⚠️ Script finalizado com avisos/erros.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Falha crítica durante execução do script:', err);
    process.exit(1);
  });
