/**
 * Script para sincronizar todos os grupos de estudo com o banco de códigos
 * Versão simplificada e mais robusta
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const fs = require('fs');
const path = require('path');

// Função para verificar e criar tabelas se necessário
async function verificarEstruturaBanco() {
  console.log('Verificando estrutura do banco de dados...');

  try {
    // Verificar tabela grupos_estudo
    const { data: gruposExistem, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (gruposError && gruposError.code === '42P01') {
      console.log('❌ Tabela grupos_estudo não existe. Por favor, execute o workflow "Corrigir Tabelas de Grupos".');
      return false;
    } else if (gruposError) {
      console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposError);
      return false;
    } else {
      console.log('✅ Tabela grupos_estudo verificada com sucesso.');
    }

    // Verificar tabela codigos_grupos_estudo
    const { data: codigosExistem, error: codigosError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo', { count: 'exact', head: true })
      .limit(1);

    if (codigosError && codigosError.code === '42P01') {
      console.log('❌ Tabela codigos_grupos_estudo não existe. Por favor, execute o workflow "Corrigir Tabelas de Grupos".');
      return false;
    } else if (codigosError) {
      console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosError);
      return false;
    } else {
      console.log('✅ Tabela codigos_grupos_estudo verificada com sucesso.');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura do banco:', error);
    return false;
  }
}

// Função principal para sincronizar códigos
async function sincronizarCodigosGrupos() {
  console.log('\n==== INÍCIO DA SINCRONIZAÇÃO DE CÓDIGOS DE GRUPOS ====\n');

  try {
    // Verificar estrutura do banco
    const estruturaOK = await verificarEstruturaBanco();
    if (!estruturaOK) {
      console.error('❌ Não foi possível realizar a sincronização devido a problemas na estrutura do banco.');
      return false;
    }

    // Buscar todos os grupos de estudo
    const { data: grupos, error } = await supabase
      .from('grupos_estudo')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar grupos:', error);
      return false;
    }

    console.log(`ℹ️ Encontrados ${grupos?.length || 0} grupos para sincronizar.`);

    // Contadores
    let sucesso = 0;
    let ignorados = 0;
    let erros = 0;

    // Processar cada grupo
    for (const grupo of grupos || []) {
      try {
        // Verificar se o grupo tem código
        if (!grupo.codigo) {
          console.log(`ℹ️ Grupo ID ${grupo.id} (${grupo.nome}) não possui código - ignorado.`);
          ignorados++;
          continue;
        }

        // Inserir ou atualizar na tabela de códigos
        const { error: sincError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert(
            {
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
            },
            { onConflict: 'codigo' }
          );

        if (sincError) {
          console.error(`❌ Erro ao sincronizar código ${grupo.codigo} para grupo ${grupo.id}:`, sincError);
          erros++;
        } else {
          console.log(`✅ Código ${grupo.codigo} sincronizado com sucesso para grupo ${grupo.id} (${grupo.nome})`);
          sucesso++;
        }
      } catch (grupoError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}:`, grupoError);
        erros++;
      }
    }

    // Relatório
    console.log('\n==== RELATÓRIO DA SINCRONIZAÇÃO ====');
    console.log(`📊 Total de grupos: ${grupos?.length || 0}`);
    console.log(`✅ Códigos sincronizados: ${sucesso}`);
    console.log(`⏭️ Grupos ignorados (sem código): ${ignorados}`);
    console.log(`❌ Erros: ${erros}`);
    console.log('====================================\n');

    return (erros === 0);
  } catch (syncError) {
    console.error('❌ Erro durante a sincronização:', syncError);
    return false;
  }
}

// Criar diretório de dados se não existir
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Executar script
sincronizarCodigosGrupos()
  .then(success => {
    if (success) {
      console.log('🎉 Sincronização concluída com sucesso!');
      process.exit(0);
    } else {
      console.error('⚠️ Sincronização concluída com avisos/erros.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Falha crítica na sincronização:', err);
    process.exit(1);
  });
```