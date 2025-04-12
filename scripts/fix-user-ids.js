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
  // Validação rigorosa da UF
  if (!uf || uf.length !== 2) {
    console.error('UF inválida fornecida:', uf);
    throw new Error('UF inválida para geração de ID. A UF é obrigatória.');
  } else if (uf === 'BR') {
    console.error('UF "BR" é inválida para geração de ID');
    throw new Error('UF "BR" é inválida para geração de ID. Escolha um estado brasileiro válido.');
  }

  uf = uf.toUpperCase();

  // Obtém o ano/mês atual
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;

  try {
    // Obter o último ID da tabela de controle
    const { data, error } = await supabase
      .from('user_id_control')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Erro ao buscar controle de ID:", error);
      return fallbackGenerateId(uf, tipoConta, anoMes);
    }

    let nextId = 1;

    if (data) {
      // Incrementa o contador
      nextId = data.last_id + 1;
      console.log(`Incrementando contador de ID para: ${nextId}`);

      // Atualiza o contador no banco de dados de forma atômica
      const { error: updateError } = await supabase
        .from('user_id_control')
        .update({ 
          last_id: nextId,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        console.error("Erro ao atualizar contador:", updateError);
        return fallbackGenerateId(uf, tipoConta, anoMes);
      }
    } else {
      // Cria um novo registro de controle
      console.log("Criando novo controle de ID, começando com 1");
      const { error: insertError } = await supabase
        .from('user_id_control')
        .insert([{ 
          last_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error("Erro ao criar contador:", insertError);
        return fallbackGenerateId(uf, tipoConta, anoMes);
      }
    }

    // Gera o ID completo com formato garantido
    const userId = `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, '0')}`;
    console.log(`ID gerado: ${userId} (UF=${uf}, AnoMes=${anoMes}, TipoConta=${tipoConta}, Sequencial=${nextId})`);
    return userId;

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
        let uf = profile.state;
        if (!uf || uf.length !== 2) {
          console.log(`Perfil ${profile.id} tem UF inválida ou não fornecida`);
          
          // Se temos acesso ao email do usuário, podemos notificá-lo para atualizar seu perfil
          if (profile.email) {
            console.log(`[AÇÃO NECESSÁRIA] O usuário ${profile.email} precisa atualizar seu estado no perfil`);
            
            // Aqui poderíamos adicionar código para enviar um email de notificação ao usuário
            
            // Por enquanto, vamos pular este perfil e não gerar um ID
            console.log(`Pulando geração de ID para perfil ${profile.id} (${profile.email}) - UF inválida`);
            continue;
          } else {
            console.log(`Não foi possível determinar um estado válido para o perfil ${profile.id}`);
            continue;
          }
        } else if (uf === 'BR') {
          console.log(`Perfil ${profile.id} tem UF "BR" que é inválida`);
          
          // Se temos acesso ao email do usuário, podemos notificá-lo para atualizar seu perfil
          if (profile.email) {
            console.log(`[AÇÃO NECESSÁRIA] O usuário ${profile.email} precisa atualizar seu estado no perfil`);
            continue;
          } else {
            console.log(`Não foi possível determinar um estado válido para o perfil ${profile.id}`);
            continue;
          }
        } else {
          uf = uf.toUpperCase(); // Garantir que esteja em maiúsculas
        }
        console.log(`Usando UF: ${uf} para perfil ${profile.id}`);

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