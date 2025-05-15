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
// Script para sincronizar códigos de grupos
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter URL e chave do Supabase do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY precisam estar definidas');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Gera um código único para um grupo
 * @returns {string} Código no formato XXXX-YYYY-ZZZZ
 */
function gerarCodigoGrupo() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  
  // Gerar primeira parte (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  // Adicionar hífen
  codigo += '-';
  
  // Gerar segunda parte (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  // Adicionar hífen
  codigo += '-';
  
  // Gerar terceira parte (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return codigo;
}

/**
 * Sincroniza códigos de grupos entre tabelas
 */
async function sincronizarCodigosGrupos() {
  console.log('🔄 Iniciando sincronização de códigos de grupos...');
  
  try {
    // Verificar tabelas
    try {
      const { error: checkGruposError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);

      if (checkGruposError && checkGruposError.code === '42P01') {
        console.error('❌ Tabela grupos_estudo não existe!');
        return {
          success: false,
          message: 'Tabela grupos_estudo não existe',
          total: 0,
          sucessos: 0,
          erros: 1,
          ignorados: 0
        };
      }

      const { error: checkCodigosError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);

      if (checkCodigosError && checkCodigosError.code === '42P01') {
        console.error('❌ Tabela codigos_grupos_estudo não existe!');
        return {
          success: false,
          message: 'Tabela codigos_grupos_estudo não existe',
          total: 0,
          sucessos: 0,
          erros: 1,
          ignorados: 0
        };
      }
    } catch (checkError) {
      console.error('❌ Erro ao verificar tabelas:', checkError);
      return {
        success: false,
        message: 'Erro ao verificar tabelas',
        total: 0,
        sucessos: 0,
        erros: 1,
        ignorados: 0
      };
    }

    // Buscar grupos sem código
    const { data: gruposSemCodigo, error: semCodigoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .is('codigo', null);

    if (semCodigoError) {
      console.error('❌ Erro ao buscar grupos sem código:', semCodigoError);
      return {
        success: false,
        message: 'Erro ao buscar grupos sem código',
        total: 0,
        sucessos: 0,
        erros: 1,
        ignorados: 0
      };
    }

    console.log(`🔍 Encontrados ${gruposSemCodigo?.length || 0} grupos sem código`);

    // Gerar códigos para grupos sem código
    let sucessosGeracao = 0;
    let errosGeracao = 0;

    for (const grupo of gruposSemCodigo || []) {
      try {
        // Gerar código único
        const novoCodigo = gerarCodigoGrupo();
        
        // Atualizar grupo com o novo código
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ codigo: novoCodigo })
          .eq('id', grupo.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar código para grupo ${grupo.id}:`, updateError);
          errosGeracao++;
          continue;
        }

        console.log(`✅ Código ${novoCodigo} gerado para grupo ${grupo.id} (${grupo.nome})`);
        sucessosGeracao++;
      } catch (grupoError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}:`, grupoError);
        errosGeracao++;
      }
    }

    // Buscar todos os grupos para sincronizar com tabela de códigos
    const { data: todosGrupos, error: todosGruposError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .not('codigo', 'is', null);

    if (todosGruposError) {
      console.error('❌ Erro ao buscar todos os grupos:', todosGruposError);
      return {
        success: false,
        message: 'Erro ao buscar todos os grupos',
        total: gruposSemCodigo?.length || 0,
        sucessos: sucessosGeracao,
        erros: errosGeracao + 1,
        ignorados: 0
      };
    }

    console.log(`🔍 Encontrados ${todosGrupos?.length || 0} grupos com código para sincronizar`);

    // Sincronizar códigos
    let sucessosSincronizacao = 0;
    let errosSincronizacao = 0;
    let ignorados = 0;

    for (const grupo of todosGrupos || []) {
      try {
        if (!grupo.codigo) {
          console.log(`⚠️ Grupo ${grupo.id} ainda sem código. Ignorando.`);
          ignorados++;
          continue;
        }

        // Verificar se código já existe na tabela de códigos
        const { data: codigoExistente, error: codigoExistenteError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .eq('codigo', grupo.codigo)
          .maybeSingle();

        if (codigoExistenteError) {
          console.error(`❌ Erro ao verificar código ${grupo.codigo}:`, codigoExistenteError);
          errosSincronizacao++;
          continue;
        }

        if (codigoExistente) {
          // Atualizar informações
          const { error: updateError } = await supabase
            .from('codigos_grupos_estudo')
            .update({
              nome: grupo.nome || 'Grupo sem nome',
              descricao: grupo.descricao || '',
              user_id: grupo.user_id,
              privado: grupo.privado || false,
              membros: grupo.membros || 1,
              visibilidade: grupo.visibilidade || 'todos',
              disciplina: grupo.disciplina || '',
              cor: grupo.cor || '#FF6B00',
              membros_ids: grupo.membros_ids || [],
              ultima_atualizacao: new Date().toISOString()
            })
            .eq('codigo', grupo.codigo);

          if (updateError) {
            console.error(`❌ Erro ao atualizar código ${grupo.codigo}:`, updateError);
            errosSincronizacao++;
          } else {
            console.log(`✅ Código ${grupo.codigo} atualizado`);
            sucessosSincronizacao++;
          }
        } else {
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
            console.error(`❌ Erro ao inserir código ${grupo.codigo}:`, insertError);
            errosSincronizacao++;
          } else {
            console.log(`✅ Código ${grupo.codigo} inserido`);
            sucessosSincronizacao++;
          }
        }
      } catch (grupoError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}:`, grupoError);
        errosSincronizacao++;
      }
    }

    // Resultado final
    const totalSucessos = sucessosGeracao + sucessosSincronizacao;
    const totalErros = errosGeracao + errosSincronizacao;
    const totalProcessados = (gruposSemCodigo?.length || 0) + (todosGrupos?.length || 0);

    console.log('\n📊 RESUMO DA SINCRONIZAÇÃO:');
    console.log(`Total processado: ${totalProcessados}`);
    console.log(`Sucessos: ${totalSucessos}`);
    console.log(`Erros: ${totalErros}`);
    console.log(`Ignorados: ${ignorados}`);

    return {
      success: totalErros === 0,
      message: totalErros === 0 ? 'Sincronização concluída com sucesso' : 'Sincronização concluída com erros',
      total: totalProcessados,
      sucessos: totalSucessos,
      erros: totalErros,
      ignorados: ignorados
    };
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    return {
      success: false,
      message: 'Erro durante a sincronização',
      total: 0,
      sucessos: 0,
      erros: 1,
      ignorados: 0
    };
  }
}

// Executar sincronização
sincronizarCodigosGrupos()
  .then(resultado => {
    console.log('🏁 Processo finalizado!');
    if (resultado.success) {
      console.log('✅ Sincronização concluída com sucesso!');
    } else {
      console.error('⚠️ Sincronização concluída com problemas. Verifique os detalhes acima.');
    }
    process.exit(resultado.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
