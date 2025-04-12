
/**
 * Script para corrigir IDs de usuários baseados no estado (UF) selecionado
 * Este script garante que todos os IDs sigam o padrão [UF][AnoMês][TipoConta][Sequencial]
 * com numeração sequencial correta para cada UF
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
 * Gera um ID de usuário usando a função SQL do Supabase para garantir sequencial correto
 */
async function generateFixedUserId(uf, tipoConta) {
  // Validação rigorosa da UF
  if (!uf || uf.length !== 2) {
    console.error('Erro: UF inválida ou não fornecida:', uf);
    throw new Error('UF inválida para geração de ID');
  } else if (uf === 'BR') {
    console.error('Erro: UF "BR" é inválida para geração de ID');
    throw new Error('UF "BR" é inválida para geração de ID');
  }

  uf = uf.toUpperCase();

  try {
    // Obter o próximo ID usando a função SQL
    const { data, error } = await supabase.rpc('get_next_user_id_for_uf', {
      p_uf: uf,
      p_tipo_conta: tipoConta
    });

    if (error) {
      console.error('Erro ao gerar ID via função SQL:', error);
      return generateFallbackId(uf, tipoConta);
    }

    console.log(`ID gerado via função SQL: ${data}`);
    return data;
  } catch (error) {
    console.error('Erro ao chamar função RPC:', error);
    return generateFallbackId(uf, tipoConta);
  }
}

/**
 * Método de fallback para gerar ID com sequencial correto
 */
async function generateFallbackId(uf, tipoConta) {
  console.log('Usando método de fallback para geração de ID');
  
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
  
  try {
    // Verificar se existe controle para esta UF, tipo e ano/mês
    const { data: controlData, error: controlError } = await supabase
      .from('user_id_control_by_uf')
      .select('*')
      .eq('uf', uf)
      .eq('ano_mes', anoMes)
      .eq('tipo_conta', tipoConta)
      .single();
    
    let nextId = 1;
    
    if (controlError && controlError.code !== 'PGRST116') {
      console.error('Erro ao buscar controle:', controlError);
    } else if (controlData) {
      // Se existe um controle, incrementar o ID
      nextId = controlData.last_id + 1;
      
      // Atualizar o contador
      const { error: updateError } = await supabase
        .from('user_id_control_by_uf')
        .update({ 
          last_id: nextId,
          updated_at: new Date().toISOString()
        })
        .eq('id', controlData.id);
      
      if (updateError) {
        console.error('Erro ao atualizar contador:', updateError);
      }
    } else {
      // Se não existe um controle, criar um novo
      const { data: insertData, error: insertError } = await supabase
        .from('user_id_control_by_uf')
        .insert([
          { uf, ano_mes: anoMes, tipo_conta: tipoConta, last_id: nextId }
        ])
        .select();
      
      if (insertError) {
        console.error('Erro ao criar controle:', insertError);
      }
    }
    
    // Formatar o ID
    const userId = `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, '0')}`;
    console.log(`ID gerado via fallback: ${userId}`);
    return userId;
  } catch (error) {
    console.error('Erro no processo de fallback:', error);
    
    // Último recurso: gerar um ID baseado em timestamp
    const timestamp = Date.now();
    const sequencial = (timestamp % 1000000).toString().padStart(6, '0');
    const userId = `${uf}${anoMes}${tipoConta}${sequencial}`;
    
    console.log(`ID gerado com timestamp: ${userId}`);
    return userId;
  }
}

/**
 * Corrige um perfil específico usando o formato de ID correto
 */
async function fixUserProfile(profile) {
  try {
    console.log(`\nProcessando perfil: ${profile.id} (${profile.email || 'sem email'})`);
    
    // Verificar se o ID atual é válido
    if (profile.user_id && isValidUserId(profile.user_id)) {
      console.log(`Perfil já possui ID válido: ${profile.user_id}`);
      return false;
    }
    
    // Determinar o estado a ser usado
    let uf = profile.state;
    if (!uf || uf.length !== 2 || uf === 'BR') {
      console.log(`Estado inválido: "${uf}", buscando estado correto...`);
      
      // Tentar usar a função SQL para corrigir o ID
      try {
        const { data, error } = await supabase.rpc('fix_user_id_format', {
          p_profile_id: profile.id
        });
        
        if (error) {
          console.error('Erro ao corrigir ID via função SQL:', error);
        } else {
          console.log(`ID corrigido via função SQL: ${data}`);
          return true;
        }
      } catch (sqlError) {
        console.error('Erro ao chamar função de correção:', sqlError);
      }
      
      console.log('Verificando estado do usuário no localStorage...');
      try {
        // Verificar se temos um estado salvo no perfil
        const { data: savedStateData } = await supabase
          .from('profiles')
          .select('state')
          .eq('id', profile.id)
          .single();
        
        if (savedStateData && savedStateData.state && 
            savedStateData.state.length === 2 && 
            savedStateData.state !== 'BR') {
          uf = savedStateData.state;
          console.log(`Estado encontrado no perfil: ${uf}`);
        } else {
          // Sem UF válida, usar SP como padrão
          console.log('Sem estado válido encontrado, usando SP como padrão');
          uf = 'SP';
          
          // Atualizar o estado no perfil
          const { error: updateStateError } = await supabase
            .from('profiles')
            .update({ state: uf })
            .eq('id', profile.id);
          
          if (updateStateError) {
            console.error('Erro ao atualizar estado no perfil:', updateStateError);
          } else {
            console.log(`Estado atualizado para: ${uf}`);
          }
        }
      } catch (stateError) {
        console.error('Erro ao verificar estado:', stateError);
        uf = 'SP';
      }
    }
    
    // Determinar o tipo de conta
    const tipoConta = profile.plan_type?.toLowerCase() === 'full' || 
                    profile.plan_type?.toLowerCase() === 'premium' ? 1 : 2;
    
    console.log(`Gerando ID com UF=${uf}, tipoConta=${tipoConta}`);
    
    // Gerar o novo ID com o sistema correto
    const newId = await generateFixedUserId(uf, tipoConta);
    
    // Atualizar o perfil com o novo ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        user_id: newId,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);
    
    if (updateError) {
      console.error('Erro ao atualizar perfil com novo ID:', updateError);
      return false;
    }
    
    console.log(`Perfil atualizado com sucesso. Novo ID: ${newId}`);
    return true;
  } catch (error) {
    console.error(`Erro ao processar perfil ${profile.id}:`, error);
    return false;
  }
}

/**
 * Função principal para corrigir todos os IDs de usuário
 */
async function fixAllUserIds() {
  console.log('Iniciando correção de IDs de usuários com garantia de estado...');

  try {
    // Buscar todos os perfis
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
      const updated = await fixUserProfile(profile);
      if (updated) updatedCount++;
    }

    console.log(`\nProcesso finalizado. ${updatedCount} de ${profiles.length} perfis foram atualizados.`);

  } catch (error) {
    console.error('Erro ao executar correção de IDs:', error);
  }
}

// Executar a função principal
fixAllUserIds()
  .then(() => {
    console.log('Script finalizado com sucesso.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro inesperado no script:', error);
    process.exit(1);
  });
