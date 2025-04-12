/**
 * Script para corrigir IDs de usuários no banco de dados
 * Este script verifica todos os perfis sem um ID válido e gera novos IDs automaticamente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verifica se um ID de usuário está no formato correto
 * [UF][AnoMês][TipoConta][Sequencial]
 */
function isValidUserId(id) {
  // Verifica se corresponde ao padrão: 2 letras + 4 números + 1 número + 6 números
  return /^[A-Z]{2}\d{4}[1-2]\d{6}$/.test(id);
}

/**
 * Gera um ID de usuário com o formato correto
 */
async function generateUserId(uf, tipoConta) {
  // Validação básica da UF
  if (!uf || uf.length !== 2 || uf === 'BR') {
    console.warn('UF inválida fornecida:', uf);
    uf = 'SP';
  }

  uf = uf.toUpperCase();

  // Obtém o ano/mês atual
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;

  try {
    // Obter o último ID
    const { data, error } = await supabase
      .from('user_id_control')
      .select('last_id')
      .single();

    if (error) {
      console.error("Erro ao buscar último ID:", error);
      return fallbackGenerateId(uf, tipoConta, anoMes);
    }

    let nextId = 1;

    if (data) {
      // Incrementa o contador
      nextId = data.last_id + 1;

      // Atualiza o contador no banco de dados
      const { error: updateError } = await supabase
        .from('user_id_control')
        .update({ last_id: nextId })
        .eq('id', 1);

      if (updateError) {
        console.error("Erro ao atualizar contador:", updateError);
        return fallbackGenerateId(uf, tipoConta, anoMes);
      }
    } else {
      // Cria um novo registro de controle
      const { error: insertError } = await supabase
        .from('user_id_control')
        .insert([{ last_id: 1 }]);

      if (insertError) {
        console.error("Erro ao criar contador:", insertError);
        return fallbackGenerateId(uf, tipoConta, anoMes);
      }
    }

    // Gera o ID completo
    return `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, '0')}`;

  } catch (error) {
    console.error("Erro inesperado:", error);
    return fallbackGenerateId(uf, tipoConta, anoMes);
  }
}

/**
 * Método de fallback para gerar ID quando o banco de dados falha
 */
function fallbackGenerateId(uf, tipoConta, anoMes) {
  const timestamp = Date.now();
  return `${uf}${anoMes}${tipoConta}${timestamp.toString().slice(-6)}`;
}

/**
 * Função para executar SQL personalizado
 */
async function executeSql(sql) {
  try {
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    return false;
  }
}

/**
 * Função principal para corrigir IDs de usuário
 */
async function fixUserIds() {
  console.log('Iniciando correção de IDs de usuários...');

  try {
    // Buscar todos os perfis sem ID válido
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Erro ao buscar perfis:', error);
      return;
    }

    console.log(`Encontrados ${profiles.length} perfis para análise.`);

    // Contador de perfis atualizados
    let updatedCount = 0;

    // Processar cada perfil
    for (const profile of profiles) {
      // Verifica se o ID atual é válido
      if (!profile.user_id || !isValidUserId(profile.user_id)) {
        console.log(`Perfil ${profile.id} (${profile.username || profile.email || 'sem nome'}) não tem ID válido.`);

        // Determinar o tipo de conta
        const tipoConta = profile.plan_type?.toLowerCase() === 'full' || 
                        profile.plan_type?.toLowerCase() === 'premium' ? 1 : 2;

        // Determinar a UF
        const uf = profile.state && profile.state.length === 2 ? profile.state : 'SP';

        // Gerar novo ID
        const newId = await generateUserId(uf, tipoConta);

        // Atualizar o perfil
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            user_id: newId,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Erro ao atualizar perfil ${profile.id}:`, updateError);
        } else {
          console.log(`Perfil ${profile.id} atualizado com sucesso. Novo ID: ${newId}`);
          updatedCount++;
        }
      }
    }

    console.log(`Processo finalizado. ${updatedCount} perfis foram atualizados.`);

  } catch (error) {
    console.error('Erro ao executar correção de IDs:', error);
  }
}

// Executar a função principal
fixUserIds()
  .then(() => {
    console.log('Script finalizado com sucesso.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro inesperado no script:', error);
    process.exit(1);
  });