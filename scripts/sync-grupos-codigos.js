/**
 * Script para sincronizar todos os grupos de estudo com o banco de códigos
 * Este script deve ser executado após a criação da nova tabela de códigos
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const fs = require('fs');
const path = require('path');

// Função para verificar e criar tabelas se necessário
async function checkAndCreateTables() {
  console.log('Verificando e criando tabelas se necessário...');

  try {
    // Verificar extensão uuid-ossp
    try {
      const { error: uuidError } = await supabase.rpc('execute_sql', { 
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` 
      }).catch(() => ({ error: null }));

      if (uuidError) {
        console.log('Aviso: Não foi possível criar extensão uuid-ossp:', uuidError);
        // Tentando método alternativo
        try {
          // Este método evita usar supabase.query
          await supabase.from('_temp_sql_operation').select('*').limit(0);
          console.log('Utilizando método alternativo para operações SQL');
        } catch (altError) {
          console.log('Aviso: Também não foi possível usar método alternativo:', altError);
        }
      }
    } catch (uuidExtError) {
      console.log('Aviso: Erro ao verificar extensão uuid-ossp:', uuidExtError);
    }

    // Verificar se a tabela grupos_estudo existe
    const { data: gruposCount, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('*', { count: 'exact', head: true });

    if (gruposError && gruposError.code === '42P01') {
      console.log('Tabela grupos_estudo não existe, criando...');

      try {
        // Usar metodo RPC se disponível
        const { error: createError } = await supabase.rpc('execute_sql', {
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

            DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
            CREATE POLICY "Usuários podem excluir grupos"
              ON public.grupos_estudo FOR DELETE
              USING (true);
          `
        }).catch(() => ({ error: true }));

        if (createError) {
          console.error('Erro ao criar tabela grupos_estudo via RPC:', createError);
          console.log('Por favor, execute o workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
          return false;
        }

        console.log('Tabela grupos_estudo criada com sucesso!');
      } catch (createGruposError) {
        console.error('Erro ao criar tabela grupos_estudo:', createGruposError);
        console.log('Por favor, execute o workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
        return false;
      }
    } else if (gruposError) {
      console.error('Erro ao verificar tabela grupos_estudo:', gruposError);
      return false;
    } else {
      console.log(`Tabela grupos_estudo existe com ${gruposCount || 0} registros`);
    }

    // Verificar se a tabela codigos_grupos_estudo existe
    const { data: codigosCount, error: codigosError } = await supabase
      .from('codigos_grupos_estudo')
      .select('*', { count: 'exact', head: true });

    if (codigosError && codigosError.code === '42P01') {
      console.log('Tabela codigos_grupos_estudo não existe, criando...');

      try {
        // Usar metodo RPC se disponível
        const { error: createError } = await supabase.rpc('execute_sql', {
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
          `
        }).catch(() => ({ error: true }));

        if (createError) {
          console.error('Erro ao criar tabela codigos_grupos_estudo via RPC:', createError);
          console.log('Por favor, execute o workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
          return false;
        }

        console.log('Tabela codigos_grupos_estudo criada com sucesso!');
      } catch (createCodigosError) {
        console.error('Erro ao criar tabela codigos_grupos_estudo:', createCodigosError);
        console.log('Por favor, execute o workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
        return false;
      }
    } else if (codigosError) {
      console.error('Erro ao verificar tabela codigos_grupos_estudo:', codigosError);
      return false;
    } else {
      console.log(`Tabela codigos_grupos_estudo existe com ${codigosCount || 0} registros`);
    }

    // Verificar se as tabelas estão acessíveis
    try {
      const { data: gruposCheck, error: gruposCheckError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);

      if (gruposCheckError) {
        console.error('❌ Tabela grupos_estudo não está acessível:', gruposCheckError);
        return false;
      }

      const { data: codigosCheck, error: codigosCheckError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);

      if (codigosCheckError) {
        console.error('❌ Tabela codigos_grupos_estudo não está acessível:', codigosCheckError);
        return false;
      }

      console.log('✅ Ambas as tabelas estão acessíveis');
      return true;
    } catch (checkError) {
      console.error('❌ Erro ao verificar acesso às tabelas:', checkError);
      return false;
    }
  } catch (error) {
    console.error('Erro durante verificação/criação de tabelas:', error);
    return false;
  }
}

// Função para sincronizar grupos locais
async function sincronizarGruposLocais() {
  try {
    console.log("Buscando grupos locais para sincronizar...");

    // Tentar obter grupos do localStorage (primeiro é necessário um fallback)
    const gruposLocal = [];
    
    // Verificar se temos grupos em formato localStorage no sistema de arquivos
    const gruposFallbackPath = path.join(__dirname, '..', 'data', 'grupos_backup.json');
    
    if (fs.existsSync(gruposFallbackPath)) {
      try {
        const gruposRaw = fs.readFileSync(gruposFallbackPath, 'utf8');
        const gruposFallback = JSON.parse(gruposRaw);
        
        if (Array.isArray(gruposFallback) && gruposFallback.length > 0) {
          console.log(`Encontrados ${gruposFallback.length} grupos no backup local`);
          
          // Para cada grupo do backup, tentar inserir no Supabase
          for (const grupo of gruposFallback) {
            if (!grupo.id || !grupo.nome) continue;
            
            try {
              // Verificar se já existe
              const { data: existing, error: checkError } = await supabase
                .from('grupos_estudo')
                .select('id')
                .eq('id', grupo.id)
                .maybeSingle();
                
              if (checkError) {
                console.error(`Erro ao verificar grupo ${grupo.id}:`, checkError);
                continue;
              }
              
              if (!existing) {
                // Inserir no banco
                const { error: insertError } = await supabase
                  .from('grupos_estudo')
                  .insert({
                    id: grupo.id,
                    user_id: grupo.user_id || grupo.criador || '00000000-0000-0000-0000-000000000000',
                    nome: grupo.nome,
                    descricao: grupo.descricao || '',
                    cor: grupo.cor || '#FF6B00',
                    membros: grupo.membros || 1,
                    membros_ids: grupo.membros_ids || [],
                    topico: grupo.topico || null,
                    topico_nome: grupo.topico_nome || null,
                    topico_icon: grupo.topico_icon || null,
                    privado: grupo.privado || false,
                    visibilidade: grupo.visibilidade || 'todos',
                    codigo: grupo.codigo || null,
                    disciplina: grupo.disciplina || 'Geral',
                    data_criacao: grupo.dataCriacao || grupo.data_criacao || new Date().toISOString()
                  });
                  
                if (insertError) {
                  console.error(`Erro ao inserir grupo ${grupo.id}:`, insertError);
                } else {
                  console.log(`Grupo ${grupo.id} (${grupo.nome}) inserido com sucesso!`);
                  gruposLocal.push(grupo);
                }
              } else {
                console.log(`Grupo ${grupo.id} (${grupo.nome}) já existe no banco`);
                gruposLocal.push(grupo);
              }
            } catch (grupoError) {
              console.error(`Erro ao processar grupo ${grupo.id}:`, grupoError);
            }
          }
        }
      } catch (fallbackError) {
        console.error('Erro ao processar backup de grupos:', fallbackError);
      }
    } else {
      console.log('Nenhum backup local de grupos encontrado');
    }
    
    return gruposLocal;
  } catch (error) {
    console.error('Erro ao sincronizar grupos locais:', error);
    return [];
  }
}

async function syncGruposCodigos() {
  console.log('Iniciando sincronização de códigos de grupos...');

  try {
    // Primeiro verificar e criar tabelas se necessário
    const tabelasOK = await checkAndCreateTables();

    if (!tabelasOK) {
      console.error('Erro: As tabelas necessárias não estão disponíveis. Por favor, execute o workflow "Corrigir Tabelas de Grupos".');
      return;
    }

    // Sincronizar grupos locais
    // const gruposLocais = await sincronizarGruposLocais();
    // console.log(`Sincronizados ${gruposLocais.length} grupos locais`);

    // Buscar todos os grupos de estudo
    const { data: grupos, error } = await supabase
      .from('grupos_estudo')
      .select('*');

    if (error) {
      console.error(`Erro ao buscar grupos: ${error.message}`);

      if (error.code === '42P01') { // Tabela não existe
        console.log('A tabela grupos_estudo não existe. Talvez a criação tenha falhado.');
        console.log('Por favor, execute o workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
        return;
      }

      throw new Error(`Erro ao buscar grupos: ${error.message}`);
    }

    console.log(`Encontrados ${grupos?.length || 0} grupos para sincronizar`);

    // Contador de sucessos
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Processar cada grupo
    for (const grupo of grupos || []) {
      try {
        // Verificar se o grupo já tem código
        if (!grupo.codigo) {
          console.log(`Grupo ID ${grupo.id} não possui código, será ignorado`);
          skippedCount++;
          continue;
        }

        // Inserir no banco de códigos
        const { error: insertError } = await supabase
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

        if (insertError) {
          console.error(`Erro ao inserir código ${grupo.codigo} para grupo ${grupo.id}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`Código ${grupo.codigo} sincronizado com sucesso para grupo ${grupo.id}`);
          successCount++;
        }
      } catch (itemError) {
        console.error(`Erro ao processar grupo ${grupo.id}: ${itemError.message}`);
        errorCount++;
      }
    }

    console.log('--------- RESUMO DA SINCRONIZAÇÃO ---------');
    console.log(`Total de grupos: ${grupos?.length || 0}`);
    console.log(`Códigos sincronizados com sucesso: ${successCount}`);
    console.log(`Grupos sem código (ignorados): ${skippedCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log('-------------------------------------------');

  } catch (error) {
    console.error('Erro durante sincronização:', error);
    process.exit(1);
  }
}

// Criar diretório de dados se não existir
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Executar o script
syncGruposCodigos()
  .then(() => {
    console.log('Sincronização concluída!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Falha na sincronização:', err);
    process.exit(1);
  });