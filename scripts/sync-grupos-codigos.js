// Script para sincronizar grupos de estudo e seus códigos de convite
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Função principal para sincronizar grupos e códigos
async function sincronizarGruposECodigos() {
  console.log('🔄 Iniciando sincronização de grupos e códigos...');

  try {
    // 1. Verificar se as tabelas existem
    console.log('Verificando tabelas...');
    let tabelasExistem = true;

    try {
      const { count: countGrupos, error: errorGrupos } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (errorGrupos) {
        console.error('Tabela grupos_estudo não existe:', errorGrupos.message);
        tabelasExistem = false;
      } else {
        console.log(`Tabela grupos_estudo existe com ${countGrupos || 0} registros`);
      }
    } catch (err) {
      console.error('Erro ao verificar tabela grupos_estudo:', err.message);
      tabelasExistem = false;
    }

    try {
      const { count: countCodigos, error: errorCodigos } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (errorCodigos) {
        console.error('Tabela codigos_grupos_estudo não existe:', errorCodigos.message);
        tabelasExistem = false;
      } else {
        console.log(`Tabela codigos_grupos_estudo existe com ${countCodigos || 0} registros`);
      }
    } catch (err) {
      console.error('Erro ao verificar tabela codigos_grupos_estudo:', err.message);
      tabelasExistem = false;
    }

    // Se as tabelas não existem, criar
    if (!tabelasExistem) {
      console.log('Tabelas não existem. Criando...');
      await criarTabelas();
    }

    // 2. Buscar todos os grupos
    console.log('Buscando grupos para sincronizar...');
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('*');

    if (gruposError) {
      throw new Error(`Erro ao buscar grupos: ${gruposError.message}`);
    }

    console.log(`Encontrados ${grupos?.length || 0} grupos para sincronizar`);

    // 3. Processar cada grupo
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let newCodeCount = 0;

    console.log('\nIniciando processamento de grupos...');
    for (const grupo of grupos || []) {
      try {
        // Verificar se o grupo já tem código
        if (!grupo.codigo) {
          console.log(`Grupo ID ${grupo.id} não possui código, gerando novo código...`);

          // Gerar um código aleatório
          const novoCodigo = gerarCodigoConvite();

          // Atualizar o grupo com o novo código
          const { error: updateError } = await supabase
            .from('grupos_estudo')
            .update({ codigo: novoCodigo })
            .eq('id', grupo.id);

          if (updateError) {
            console.error(`Erro ao atualizar grupo ${grupo.id} com novo código:`, updateError.message);
            errorCount++;
            continue;
          }

          // Definir o código para sincronização
          grupo.codigo = novoCodigo;
          newCodeCount++;
          console.log(`Novo código ${novoCodigo} gerado para grupo ${grupo.id}`);
        }

        // Verificar se o código já existe na tabela de códigos
        const { data: codigoExistente, error: codigoError } = await supabase
          .from('codigos_grupos_estudo')
          .select('*')
          .eq('codigo', grupo.codigo)
          .single();

        if (codigoError && codigoError.code !== 'PGRST116') {
          console.error(`Erro ao verificar código ${grupo.codigo}:`, codigoError.message);
          errorCount++;
          continue;
        }

        if (codigoExistente) {
          console.log(`Código ${grupo.codigo} já existe, atualizando informações...`);

          // Atualizar informações
          const { error: updateError } = await supabase
            .from('codigos_grupos_estudo')
            .update({
              nome: grupo.nome || codigoExistente.nome,
              descricao: grupo.descricao || codigoExistente.descricao,
              membros: grupo.membros || codigoExistente.membros,
              membros_ids: grupo.membros_ids || codigoExistente.membros_ids,
              privado: grupo.privado !== undefined ? grupo.privado : codigoExistente.privado,
              visibilidade: grupo.visibilidade || codigoExistente.visibilidade,
              disciplina: grupo.disciplina || codigoExistente.disciplina,
              cor: grupo.cor || codigoExistente.cor,
              ultima_atualizacao: new Date().toISOString()
            })
            .eq('codigo', grupo.codigo);

          if (updateError) {
            console.error(`Erro ao atualizar código ${grupo.codigo}:`, updateError.message);
            errorCount++;
          } else {
            console.log(`Código ${grupo.codigo} atualizado com sucesso`);
            successCount++;
          }
        } else {
          console.log(`Código ${grupo.codigo} não existe, inserindo novo registro...`);

          // Inserir novo registro
          const { error: insertError } = await supabase
            .from('codigos_grupos_estudo')
            .insert({
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
            });

          if (insertError) {
            console.error(`Erro ao inserir código ${grupo.codigo}:`, insertError.message);
            errorCount++;
          } else {
            console.log(`Código ${grupo.codigo} inserido com sucesso`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Erro ao processar grupo ${grupo.id}:`, error.message);
        errorCount++;
      }
    }

    // 4. Resumo da sincronização
    console.log('\n--------- RESUMO DA SINCRONIZAÇÃO ---------');
    console.log(`Total de grupos: ${grupos?.length || 0}`);
    console.log(`Códigos sincronizados com sucesso: ${successCount}`);
    console.log(`Novos códigos gerados: ${newCodeCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log(`Grupos ignorados: ${skippedCount}`);
    console.log('-------------------------------------------');

    return {
      success: true,
      totalGrupos: grupos?.length || 0,
      successCount,
      errorCount,
      skippedCount,
      newCodeCount
    };
  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para gerar código de convite aleatório
function gerarCodigoConvite() {
  // Caracteres que serão usados para gerar o código (excluindo caracteres ambíguos como 0/O, 1/I)
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';

  // Gerar 8 caracteres aleatórios
  for (let i = 0; i < 8; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres.charAt(indice);
  }

  // Retornar apenas o código sem formatação
  return codigo;
}

// Função para criar tabelas
async function criarTabelas() {
  try {
    console.log('Criando tabelas necessárias...');

    // 1. Extensão UUID
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('Extensão UUID verificada/criada');
    } catch (err) {
      console.warn('Aviso ao criar extensão UUID:', err.message);
    }

    // 2. Tabela grupos_estudo
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

        DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem excluir grupos"
          ON public.grupos_estudo FOR DELETE
          USING (true);
      `);
      console.log('Tabela grupos_estudo criada com sucesso');
    } catch (err) {
      console.error('Erro ao criar tabela grupos_estudo:', err.message);
      throw err;
    }

    // 3. Tabela codigos_grupos_estudo
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
      console.log('Tabela codigos_grupos_estudo criada com sucesso');
    } catch (err) {
      console.error('Erro ao criar tabela codigos_grupos_estudo:', err.message);
      throw err;
    }

    console.log('Todas as tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
}

// Executar script
sincronizarGruposECodigos()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Sincronização concluída com sucesso!');
      process.exit(0);
    } else {
      console.error('\n❌ Falha na sincronização:', result.error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ Erro fatal durante execução do script:', err);
    process.exit(1);
  });