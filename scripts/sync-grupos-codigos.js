/**
 * Script para sincronizar códigos de grupos de estudo
 * Versão simplificada e robusta
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter URL e chave do Supabase do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não definidas');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verifica se as tabelas necessárias existem
 * @returns {Promise<boolean>} true se as tabelas existem, false caso contrário
 */
async function verificarTabelas() {
  console.log('🔍 Verificando se as tabelas necessárias existem...');

  try {
    // Verificar tabela grupos_estudo
    const { data: gruposData, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (gruposError && gruposError.code === '42P01') {
      console.error('❌ Tabela grupos_estudo não existe. Execute o workflow "Corrigir Tabelas de Grupos" primeiro.');
      return false;
    } else if (gruposError) {
      console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposError);
      return false;
    }

    // Verificar tabela codigos_grupos_estudo
    const { data: codigosData, error: codigosError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo', { count: 'exact', head: true })
      .limit(1);

    if (codigosError && codigosError.code === '42P01') {
      console.error('❌ Tabela codigos_grupos_estudo não existe. Execute o workflow "Corrigir Tabelas de Grupos" primeiro.');
      return false;
    } else if (codigosError) {
      console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosError);
      return false;
    }

    console.log('✅ Tabelas necessárias existem');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  }
}

/**
 * Gera um código único para um grupo
 * @returns {string} Código único no formato XXXX-YYYY-ZZZZ
 */
function gerarCodigoGrupo() {
  // Caracteres permitidos (excluindo caracteres ambíguos como 0/O, 1/I)
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';

  // Gerar código de 4-4-4 caracteres
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  codigo += '-';

  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  codigo += '-';

  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return codigo;
}

/**
 * Gera códigos para grupos que não possuem
 * @returns {Promise<{sucessos: number, erros: number}>} Resultado da operação
 */
async function gerarCodigosParaGruposSemCodigo() {
  console.log('🔍 Buscando grupos sem código...');

  try {
    // Buscar grupos sem código
    const { data: gruposSemCodigo, error } = await supabase
      .from('grupos_estudo')
      .select('id, nome')
      .is('codigo', null);

    if (error) {
      console.error('❌ Erro ao buscar grupos sem código:', error);
      return { sucessos: 0, erros: 1 };
    }

    const total = gruposSemCodigo?.length || 0;
    console.log(`ℹ️ Encontrados ${total} grupos sem código`);

    if (total === 0) {
      return { sucessos: 0, erros: 0 };
    }

    // Gerar e atribuir códigos
    let sucessos = 0;
    let erros = 0;

    for (const grupo of gruposSemCodigo) {
      try {
        // Gerar código único
        const novoCodigo = gerarCodigoGrupo();

        // Atualizar o grupo com o novo código
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ codigo: novoCodigo })
          .eq('id', grupo.id);

        if (updateError) {
          console.error(`❌ Erro ao atribuir código ao grupo ${grupo.id}:`, updateError);
          erros++;
        } else {
          console.log(`✅ Código ${novoCodigo} gerado para grupo ${grupo.id} (${grupo.nome || 'Sem nome'})`);
          sucessos++;
        }
      } catch (grupoError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}:`, grupoError);
        erros++;
      }
    }

    console.log(`📊 Códigos gerados: ${sucessos}/${total} grupos`);
    return { sucessos, erros };
  } catch (error) {
    console.error('❌ Erro ao gerar códigos para grupos sem código:', error);
    return { sucessos: 0, erros: 1 };
  }
}

/**
 * Sincroniza os códigos dos grupos entre as tabelas
 * @returns {Promise<{sucessos: number, erros: number, ignorados: number}>} Resultado da operação
 */
async function sincronizarCodigosEntreTabelas() {
  console.log('🔄 Sincronizando códigos entre as tabelas...');

  try {
    // Buscar todos os grupos com código
    const { data: gruposComCodigo, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .not('codigo', 'is', null);

    if (error) {
      console.error('❌ Erro ao buscar grupos com código:', error);
      return { sucessos: 0, erros: 1, ignorados: 0 };
    }

    const total = gruposComCodigo?.length || 0;
    console.log(`ℹ️ Encontrados ${total} grupos com código para sincronizar`);

    if (total === 0) {
      return { sucessos: 0, erros: 0, ignorados: 0 };
    }

    // Sincronizar códigos
    let sucessos = 0;
    let erros = 0;
    let ignorados = 0;

    for (const grupo of gruposComCodigo) {
      try {
        // Verificar se o código já existe na tabela de códigos
        const { data: codigoExistente, error: checkError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .eq('codigo', grupo.codigo)
          .maybeSingle();

        if (checkError) {
          console.error(`❌ Erro ao verificar código ${grupo.codigo}:`, checkError);
          erros++;
          continue;
        }

        // Preparar os dados para inserção/atualização
        const dadosCodigo = {
          codigo: grupo.codigo,
          grupo_id: grupo.id,
          nome: grupo.nome || 'Grupo sem nome',
          descricao: grupo.descricao || '',
          user_id: grupo.user_id,
          privado: grupo.privado || false,
          membros: grupo.membros || 1,
          visibilidade: grupo.visibilidade || 'todos',
          disciplina: grupo.disciplina || 'Geral',
          cor: grupo.cor || '#FF6B00',
          membros_ids: grupo.membros_ids || [],
          data_criacao: grupo.data_criacao || new Date().toISOString(),
          ultima_atualizacao: new Date().toISOString()
        };

        // Inserir ou atualizar na tabela de códigos
        const { error: upsertError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert(dadosCodigo, { onConflict: 'codigo' });

        if (upsertError) {
          console.error(`❌ Erro ao sincronizar código ${grupo.codigo}:`, upsertError);
          erros++;
        } else {
          if (codigoExistente) {
            // console.log(`✅ Código ${grupo.codigo} atualizado para grupo ${grupo.id}`);
            sucessos++;
          } else {
            console.log(`✅ Código ${grupo.codigo} inserido para grupo ${grupo.id} (${grupo.nome || 'Sem nome'})`);
            sucessos++;
          }
        }
      } catch (grupoError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}:`, grupoError);
        erros++;
      }
    }

    console.log(`📊 Códigos sincronizados: ${sucessos}/${total} grupos`);
    return { sucessos, erros, ignorados };
  } catch (error) {
    console.error('❌ Erro ao sincronizar códigos entre tabelas:', error);
    return { sucessos: 0, erros: 1, ignorados: 0 };
  }
}

/**
 * Função principal para sincronizar códigos de grupos
 */
async function sincronizarCodigosGrupos() {
  console.log('\n==== SINCRONIZAÇÃO DE CÓDIGOS DE GRUPOS DE ESTUDO ====\n');

  try {
    // 1. Verificar se as tabelas existem
    const tabelasExistem = await verificarTabelas();
    if (!tabelasExistem) {
      console.error('⚠️ Não foi possível continuar a sincronização. Execute o workflow "Corrigir Tabelas de Grupos" primeiro.');
      return false;
    }

    // 2. Gerar códigos para grupos sem código
    console.log('\n📝 ETAPA 1: Gerando códigos para grupos sem código...');
    const { sucessos: geradosSucessos, erros: geradosErros } = await gerarCodigosParaGruposSemCodigo();

    // 3. Sincronizar códigos entre tabelas
    console.log('\n🔄 ETAPA 2: Sincronizando códigos entre tabelas...');
    const { 
      sucessos: sincronizadosSucessos, 
      erros: sincronizadosErros, 
      ignorados: sincronizadosIgnorados 
    } = await sincronizarCodigosEntreTabelas();

    // 4. Relatório final
    console.log('\n==== RELATÓRIO DA SINCRONIZAÇÃO ====');
    console.log(`✅ Códigos gerados: ${geradosSucessos}`);
    console.log(`✅ Códigos sincronizados: ${sincronizadosSucessos}`);
    console.log(`⚠️ Ignorados: ${sincronizadosIgnorados}`);
    console.log(`❌ Erros totais: ${geradosErros + sincronizadosErros}`);
    console.log('====================================\n');

    return (geradosErros + sincronizadosErros) === 0;
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    return false;
  }
}

// Executar sincronização
sincronizarCodigosGrupos()
  .then(success => {
    if (success) {
      console.log('🎉 Sincronização concluída com SUCESSO!');
      process.exit(0);
    } else {
      console.log('⚠️ Sincronização concluída com AVISOS/ERROS. Verifique os detalhes acima.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Erro fatal durante a sincronização:', err);
    process.exit(1);
  });